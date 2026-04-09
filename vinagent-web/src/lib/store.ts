import { create } from "zustand";

import type { Citation } from "./citations";
import { evaluatePlannerDecision, type PlannerDecision, type ReasonWithCitation } from "./planner";

export type FlowState = "idle" | "happy" | "lowConfidence" | "failure" | "recovery" | "escalated";
export type ConfidenceLevel = "high" | "medium" | "low";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citationIds?: number[];
  timestamp: Date;
};

export type CourseSlot = {
  code: string;
  name: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  startHour: number;
  endHour: number;
  room?: string;
};

interface VinAgentState {
  prompt: string;
  flow: FlowState;
  selectedPlan: "A" | "B" | null;
  usePlanB: boolean;
  isEdited: boolean;
  confidenceScore: number;
  autoActionEnabled: boolean;
  redFlags: string[];
  reasons: ReasonWithCitation[];
  citations: Citation[];
  toast: { title: string; message: string } | null;
  lastDecision: PlannerDecision | null;
  messages: ChatMessage[];
  currentView: "calendar" | "list";
  isTyping: boolean;

  setPrompt: (prompt: string) => void;
  setToast: (toast: { title: string; message: string } | null) => void;
  setCurrentView: (view: "calendar" | "list") => void;
  generate: (inputPrompt: string) => void;
  acceptPlan: (plan: "A" | "B") => void;
  toggleEdit: () => void;
  escalate: () => void;
  acknowledgeFlags: () => void;
  toggleAutoAction: () => void;
  clarify: (choice: "avoidMorning" | "keepGroup") => void;
  confidenceLevel: () => ConfidenceLevel;
}

let msgCounter = 0;
function makeId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

// Plan A — Tối ưu (HK 20252): lịch chiều-sáng, chỗ ngồi còn nhiều
// Nguồn: TKB20252-FULL — slot thực tế từ SIS VinUniversity
export const PLAN_A_COURSES: CourseSlot[] = [
  { code: "IT3010E", name: "Cấu trúc dữ liệu và giải thuật", day: "Thu", startHour: 14, endHour: 17.5, room: "D7-201" },   // classId 168276 — 76/90
  { code: "IT3020E", name: "Toán rời rạc", day: "Tue", startHour: 8.5, endHour: 12, room: "C7-115" },                        // classId 167679 — 72/95
  { code: "IT3100E", name: "Lập trình hướng đối tượng", day: "Mon", startHour: 9.5, endHour: 12, room: "D9-501" },           // classId 166241 — 134/140 ⚠ gần đầy
  { code: "IT3080",  name: "Mạng máy tính", day: "Mon", startHour: 12.5, endHour: 15, room: "B1-405" },                      // classId 761897 — 17/40
];

// Plan B — Dự phòng (HK 20252): fallback khi Plan A hết chỗ
// IT3100E chuyển sang slot chiều còn nhiều chỗ; DSA đổi buổi sáng
export const PLAN_B_COURSES: CourseSlot[] = [
  { code: "IT3010E", name: "Cấu trúc dữ liệu và giải thuật", day: "Wed", startHour: 7, endHour: 10, room: "C7-115" },        // classId 167940 — 96/100 ⚠ gần đầy
  { code: "IT3020E", name: "Toán rời rạc", day: "Mon", startHour: 7, endHour: 10, room: "C7-115" },                           // classId 167683 — 80/95
  { code: "IT3100E", name: "Lập trình hướng đối tượng", day: "Thu", startHour: 15, endHour: 17.5, room: "B1-206" },          // classId 761926 — 14/40 ✓
  { code: "IT3080",  name: "Mạng máy tính", day: "Tue", startHour: 7, endHour: 9, room: "D9-106" },                           // classId 168467 — 91/120
];

export const useVinAgent = create<VinAgentState>((set, get) => ({
  prompt: "",
  flow: "idle",
  selectedPlan: null,
  usePlanB: false,
  isEdited: false,
  confidenceScore: 100,
  autoActionEnabled: false,
  redFlags: [],
  reasons: [],
  citations: [],
  toast: null,
  lastDecision: null,
  messages: [],
  currentView: "calendar",
  isTyping: false,

  setPrompt: (prompt) => set({ prompt }),
  setToast: (toast) => set({ toast }),
  setCurrentView: (view) => set({ currentView: view }),

  generate: (inputPrompt) => {
    const userMsg: ChatMessage = { id: makeId(), role: "user", text: inputPrompt, timestamp: new Date() };
    set((s) => ({ messages: [...s.messages, userMsg], isTyping: true }));

    const decision = evaluatePlannerDecision(inputPrompt);
    const flags: string[] = [];
    if (!decision.toolSnapshot.dataFresh) flags.push("Dữ liệu SIS đã cũ (vượt quá 5 phút), cần làm mới.");
    if (decision.confidenceScore < 70) flags.push("Độ tin cậy dưới 70, chưa đủ điều kiện tự động hành động.");
    if (decision.toolSnapshot.seatRisk === "high") flags.push("Rủi ro hết chỗ cao, ưu tiên Plan B.");

    let assistantText: string;
    let flow: FlowState;

    if (decision.flow === "failure") {
      flow = "failure";
      assistantText = `Đã phân tích yêu cầu của bạn. Phát hiện một số rủi ro cần lưu ý:\n\n` +
        decision.reasons.map((r) => `• ${r.text} [${r.citationIds.join(",")}]`).join("\n") +
        `\n\nĐiểm tin cậy: ${decision.confidenceScore}/100. Plan B đã sẵn sàng để chuyển đổi.`;
    } else if (decision.flow === "lowConfidence") {
      flow = "lowConfidence";
      assistantText = `Đã nhận yêu cầu, nhưng cần làm rõ thêm:\n\n` +
        decision.reasons.map((r) => `• ${r.text} [${r.citationIds.join(",")}]`).join("\n") +
        `\n\nVui lòng bổ sung thông tin để hệ thống tạo kế hoạch chính xác hơn.`;
    } else {
      flow = "happy";
      assistantText = `Đã tạo kế hoạch đăng ký học phần thành công!\n\n` +
        decision.reasons.map((r) => `• ${r.text} [${r.citationIds.join(",")}]`).join("\n") +
        `\n\nĐiểm tin cậy: ${decision.confidenceScore}/100. Bạn có thể xem lịch học bên phải và xác nhận phương án.`;
    }

    const allCitIds = decision.citations.map((c) => c.id);
    const assistantMsg: ChatMessage = { id: makeId(), role: "assistant", text: assistantText, citationIds: allCitIds, timestamp: new Date() };

    setTimeout(() => {
      set({
        messages: [...get().messages, assistantMsg],
        isTyping: false,
        flow,
        confidenceScore: decision.confidenceScore,
        redFlags: flags,
        reasons: decision.reasons,
        citations: decision.citations,
        lastDecision: decision,
        usePlanB: decision.needsPlanBFallback,
        autoActionEnabled: false,
        toast: null,
      });
    }, 600);
  },

  acceptPlan: (plan) => {
    const { flow, messages } = get();
    if (flow === "failure" && plan === "A") {
      const msg: ChatMessage = { id: makeId(), role: "assistant", text: "Plan A có rủi ro cao, hệ thống đã tự động chuyển sang Plan B để đảm bảo an toàn.", timestamp: new Date() };
      set({
        messages: [...messages, msg],
        selectedPlan: "B",
        usePlanB: true,
        flow: "recovery",
        toast: { title: "Đã kích hoạt Plan B", message: "Plan A thất bại, hệ thống chuyển sang Plan B." },
      });
      return;
    }
    const msg: ChatMessage = { id: makeId(), role: "assistant", text: `Đã xác nhận Plan ${plan}. Bạn có thể tiến hành đăng ký.`, timestamp: new Date() };
    set({
      messages: [...messages, msg],
      selectedPlan: plan,
      flow: "happy",
      toast: { title: "Sẵn sàng đăng ký", message: `Bạn đã chọn Plan ${plan}.` },
    });
  },

  toggleEdit: () => set((s) => ({
    isEdited: !s.isEdited,
    toast: { title: "Đã cập nhật", message: "Đã chỉnh sửa kế hoạch." },
  })),

  escalate: () => {
    const msg: ChatMessage = { id: makeId(), role: "assistant", text: "Đã tạo bản tóm tắt (Advisor Brief) và chuyển cho cố vấn học vụ. Cố vấn sẽ liên hệ bạn trong vòng 24 giờ.", timestamp: new Date() };
    set((s) => ({
      messages: [...s.messages, msg],
      flow: "escalated",
      toast: { title: "Đã chuyển cố vấn học vụ", message: "Advisor Brief đã tạo kèm bối cảnh phiên." },
    }));
  },

  acknowledgeFlags: () => set({
    redFlags: [],
    confidenceScore: 88,
    toast: { title: "Đã xử lý cảnh báo", message: "Cờ đỏ đã xóa, độ tin cậy đã cập nhật." },
  }),

  toggleAutoAction: () => {
    const { autoActionEnabled, confidenceScore, redFlags } = get();
    const next = !autoActionEnabled;
    if (next && (confidenceScore < 80 || redFlags.length > 0)) {
      set({ toast: { title: "Chặn tự động hành động", message: "Chưa đủ điều kiện an toàn." } });
      return;
    }
    set({
      autoActionEnabled: next,
      toast: { title: "Đã cập nhật", message: next ? "Đã bật tự động hành động." : "Đã tắt tự động hành động." },
    });
  },

  clarify: (choice) => {
    const text = choice === "avoidMorning" ? "Đã ghi nhận: ưu tiên các lớp sau 9 giờ sáng." : "Đã ghi nhận: ưu tiên giữ lịch học cùng nhóm bạn.";
    const msg: ChatMessage = { id: makeId(), role: "assistant", text, timestamp: new Date() };
    set((s) => ({
      messages: [...s.messages, msg],
      flow: "happy",
      toast: { title: "Đã ghi nhận ưu tiên", message: text },
    }));
  },

  confidenceLevel: () => {
    const { flow } = get();
    if (flow === "lowConfidence") return "low";
    if (flow === "failure") return "medium";
    return "high";
  },
}));
