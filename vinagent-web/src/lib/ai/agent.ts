import {
  GoogleGenerativeAI,
  type Content,
  type Part,
  type FunctionCall,
} from "@google/generative-ai";
import { toolDeclarations, executeToolCall } from "./tools";
import type { Citation } from "../citations";

const SYSTEM_PROMPT = `Bạn là VinAgent — trợ lý AI đăng ký học phần thông minh của VinUniversity.

## Vai trò
- Giúp sinh viên lập kế hoạch đăng ký học phần tối ưu cho HK 20252.
- Phân tích yêu cầu bằng ngôn ngữ tự nhiên (tiếng Việt), sau đó gọi tools để tra cứu dữ liệu thực từ SIS.
- Tạo Plan A (tối ưu) và Plan B (dự phòng) dựa trên ràng buộc thực tế.

## Quy trình bắt buộc
1. Khi sinh viên gửi yêu cầu đăng ký, LUÔN gọi tools theo thứ tự:
   a) get_student_profile — hiểu context sinh viên
   b) search_courses / check_schedule — tra cứu môn và lịch
   c) check_prerequisites — kiểm tra điều kiện tiên quyết
   d) generate_schedule — tạo Plan A + Plan B
2. Nếu sinh viên hỏi chung chung (không nêu môn cụ thể), dùng targetCourses từ student profile.
3. KHÔNG BAO GIỜ bịa dữ liệu — luôn gọi tool để lấy thông tin thực.

## Format phản hồi
- Trả lời bằng tiếng Việt, tự nhiên, ngắn gọn, dễ hiểu.
- Khi trích dẫn dữ liệu từ tool, PHẢI gắn citation theo format: [citation:N] (N là số thứ tự).
- Mỗi fact phải có ít nhất 1 citation.
- Cuối phản hồi, đánh giá confidence score (0-100) và ghi rõ: "Điểm tin cậy: XX/100".
- Nếu confidence < 80, khuyên sinh viên xem Plan B.
- Nếu có rủi ro hết chỗ (seatRisk high), CẢNH BÁO rõ ràng.

## Ví dụ phản hồi
"Đã kiểm tra lịch HK 20252 cho bạn [citation:1]. Tất cả điều kiện tiên quyết đáp ứng [citation:2].

**Plan A** — Tối ưu:
• IT3010E (DSA) — Thứ 5, 14:00–17:30, phòng D7-201 (76/90 chỗ)
• IT3020E (Toán rời rạc) — Thứ 3, 8:30–12:00, phòng C7-115

⚠ Lưu ý: IT3100E còn 6/140 chỗ, rủi ro hết chỗ cao [citation:3]. Nên chuẩn bị Plan B.

Điểm tin cậy: 75/100"

## Luôn nhớ
- Ưu tiên an toàn cho sinh viên — cảnh báo rủi ro rõ ràng.
- Khi không chắc chắn, hỏi lại thay vì đoán.
- Plan B luôn là phương án dự phòng khi Plan A có rủi ro.`;

export type AgentResponse = {
  text: string;
  citations: Citation[];
  confidenceScore: number;
  flow: "happy" | "lowConfidence" | "failure";
  planA: PlanSlot[] | null;
  planB: PlanSlot[] | null;
  toolsUsed: string[];
};

export type PlanSlot = {
  code: string;
  name: string;
  day: string;
  startHour: number;
  endHour: number;
  room: string;
  seats: string;
  seatRisk: string;
  classId: string;
};

const MAX_TOOL_ROUNDS = 6;

export async function runAgent(
  userMessage: string,
  history: Content[]
): Promise<AgentResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const model = process.env.DEFAULT_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({
    model,
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: toolDeclarations }],
  });

  const chat = gemini.startChat({ history });
  const citations: Citation[] = [];
  let citationCounter = 1;
  let planA: PlanSlot[] | null = null;
  let planB: PlanSlot[] | null = null;
  const toolsUsed: string[] = [];

  let response = await chat.sendMessage(userMessage);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const candidate = response.response.candidates?.[0];
    if (!candidate) break;

    const functionCalls: FunctionCall[] = [];
    for (const part of candidate.content.parts) {
      if (part.functionCall) {
        functionCalls.push(part.functionCall);
      }
    }

    if (functionCalls.length === 0) break;

    const functionResponses: Part[] = [];
    for (const fc of functionCalls) {
      toolsUsed.push(fc.name);
      const result = executeToolCall(
        fc.name,
        (fc.args as Record<string, unknown>) || {}
      );

      const resultObj = result as Record<string, unknown>;
      if (resultObj._citation) {
        const cit = resultObj._citation as {
          type: string;
          title: string;
          detail: string;
        };
        const id = citationCounter++;
        citations.push({
          id,
          type: cit.type as Citation["type"],
          title: cit.title,
          detail: cit.detail,
          timestamp: new Date().toLocaleString("vi-VN"),
        });
        resultObj._citationId = id;
      }

      if (fc.name === "generate_schedule") {
        const schedResult = resultObj as {
          planA: PlanSlot[] | null;
          planB: PlanSlot[] | null;
        };
        if (schedResult.planA) planA = schedResult.planA;
        if (schedResult.planB) planB = schedResult.planB;
      }

      functionResponses.push({
        functionResponse: {
          name: fc.name,
          response: { result: resultObj },
        },
      });
    }

    response = await chat.sendMessage(functionResponses);
  }

  let text =
    response.response.candidates?.[0]?.content?.parts
      ?.filter((p) => p.text)
      .map((p) => p.text)
      .join("\n") || "Xin lỗi, không thể xử lý yêu cầu.";

  text = text.replace(/\[citation:(\d+)\]/g, "[$1]");

  const scoreMatch = text.match(/Điểm tin cậy:\s*(\d+)/);
  let confidenceScore = 85;
  if (scoreMatch) {
    confidenceScore = parseInt(scoreMatch[1], 10);
  }

  let flow: AgentResponse["flow"] = "happy";
  if (confidenceScore < 50) flow = "failure";
  else if (confidenceScore < 80) flow = "lowConfidence";

  return { text, citations, confidenceScore, flow, planA, planB, toolsUsed };
}
