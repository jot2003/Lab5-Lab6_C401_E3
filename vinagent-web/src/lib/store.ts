import { create } from "zustand";

import type { ConfidenceLevel } from "@/components/vinagent-ui";
import { evaluatePlannerDecision, type PlannerDecision } from "@/lib/planner";

type FlowState = "idle" | "happy" | "lowConfidence" | "failure" | "recovery" | "escalated";

interface VinAgentState {
  prompt: string;
  flow: FlowState;
  selectedPlan: "A" | "B" | null;
  usePlanB: boolean;
  isEdited: boolean;
  confidenceScore: number;
  autoActionEnabled: boolean;
  redFlags: string[];
  reasons: string[];
  toast: { title: string; message: string } | null;
  lastDecision: PlannerDecision | null;

  setPrompt: (prompt: string) => void;
  setToast: (toast: { title: string; message: string } | null) => void;
  generate: (inputPrompt: string) => void;
  acceptPlan: (plan: "A" | "B") => void;
  toggleEdit: () => void;
  escalate: () => void;
  acknowledgeFlags: () => void;
  toggleAutoAction: () => void;
  clarify: (choice: "avoidMorning" | "keepGroup") => void;

  confidenceLevel: () => ConfidenceLevel;
}

export const useVinAgent = create<VinAgentState>((set, get) => ({
  prompt: "",
  flow: "idle",
  selectedPlan: null,
  usePlanB: false,
  isEdited: false,
  confidenceScore: 100,
  autoActionEnabled: false,
  redFlags: [],
  reasons: [
    "Nhập yêu cầu để hệ thống tạo kế hoạch theo đúng ưu tiên cá nhân.",
  ],
  toast: null,
  lastDecision: null,

  setPrompt: (prompt) => set({ prompt }),
  setToast: (toast) => set({ toast }),

  generate: (inputPrompt) => {
    const decision = evaluatePlannerDecision(inputPrompt);
    const flags: string[] = [];
    if (!decision.toolSnapshot.dataFresh) flags.push("Dữ liệu SIS đã cũ (>5 phút), cần làm mới.");
    if (decision.confidenceScore < 70) flags.push("Độ tin cậy dưới 70, chưa đủ auto-action.");
    if (decision.toolSnapshot.seatRisk === "high") flags.push("Rủi ro hết chỗ cao, ưu tiên Plan B.");

    const reasons = [
      ...decision.reasons,
      `Nguồn: ${decision.toolSnapshot.sourceTimestamp}, dữ liệu ${decision.toolSnapshot.dataFresh ? "mới" : "cũ"}.`,
    ];

    const base = {
      confidenceScore: decision.confidenceScore,
      redFlags: flags,
      reasons,
      lastDecision: decision,
      autoActionEnabled: false,
    };

    if (decision.flow === "failure") {
      set({
        ...base,
        flow: "failure",
        usePlanB: decision.needsPlanBFallback,
        toast: { title: "Kịch bản rủi ro cao", message: "Plan A có thể thất bại. Plan B đã sẵn sàng." },
      });
      return;
    }
    if (decision.flow === "lowConfidence") {
      set({
        ...base,
        flow: "lowConfidence",
        usePlanB: decision.needsPlanBFallback,
        toast: { title: "Phát hiện độ tin cậy thấp", message: "Cần xác nhận thêm ưu tiên." },
      });
      return;
    }
    set({
      ...base,
      flow: "happy",
      usePlanB: decision.needsPlanBFallback,
      toast: { title: "Đã tạo kế hoạch", message: `Điểm tin cậy: ${decision.confidenceScore}/100.` },
    });
  },

  acceptPlan: (plan) => {
    const { flow } = get();
    if (flow === "failure" && plan === "A") {
      set({
        selectedPlan: "B",
        usePlanB: true,
        flow: "recovery",
        toast: { title: "Đã kích hoạt Plan B", message: "Plan A thất bại, hệ thống chuyển sang Plan B." },
      });
      return;
    }
    set({
      selectedPlan: plan,
      flow: "happy",
      toast: { title: "Sẵn sàng đăng ký", message: `Bạn đã chọn Plan ${plan}.` },
    });
  },

  toggleEdit: () => set((s) => ({
    isEdited: !s.isEdited,
    toast: { title: "Đã cập nhật kế hoạch", message: "Đã thêm khoảng nghỉ vào lịch." },
  })),

  escalate: () => set({
    flow: "escalated",
    toast: { title: "Đã chuyển cố vấn", message: "Advisor brief đã tạo kèm bối cảnh phiên." },
  }),

  acknowledgeFlags: () => set({
    redFlags: [],
    confidenceScore: 88,
    toast: { title: "Đã xử lý cảnh báo", message: "Cờ đỏ đã xóa, confidence đã cập nhật." },
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

  clarify: (choice) => set({
    flow: "happy",
    toast: {
      title: "Đã ghi nhận",
      message: choice === "avoidMorning" ? "Ưu tiên lớp sau 9h00." : "Ưu tiên giữ lịch cùng nhóm.",
    },
  }),

  confidenceLevel: () => {
    const { flow } = get();
    if (flow === "lowConfidence") return "low";
    if (flow === "failure") return "medium";
    return "high";
  },
}));
