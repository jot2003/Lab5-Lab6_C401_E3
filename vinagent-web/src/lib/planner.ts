export type PlannerFlow = "happy" | "lowConfidence" | "failure";

export type ToolSnapshot = {
  prerequisitesOk: boolean;
  seatRisk: "low" | "medium" | "high";
  dataFresh: boolean;
  sourceTimestamp: string;
};

export type PlannerDecision = {
  flow: PlannerFlow;
  confidenceScore: number;
  reasons: string[];
  needsPlanBFallback: boolean;
  toolSnapshot: ToolSnapshot;
};

function normalizePrompt(prompt: string) {
  return prompt.trim().toLowerCase();
}

function runMockTools(prompt: string): ToolSnapshot {
  const normalized = normalizePrompt(prompt);
  const prerequisitesOk = !normalized.includes("missing prereq");
  const staleDataSignal =
    normalized.includes("stale") || normalized.includes("high risk");
  const seatRisk: ToolSnapshot["seatRisk"] = normalized.includes("near full")
    ? "high"
    : normalized.includes("waitlist")
      ? "medium"
      : staleDataSignal
        ? "high"
        : "low";

  return {
    prerequisitesOk,
    seatRisk,
    dataFresh: !staleDataSignal,
    sourceTimestamp: "SIS snapshot 10:32",
  };
}

export function evaluatePlannerDecision(prompt: string): PlannerDecision {
  const normalized = normalizePrompt(prompt);
  const toolSnapshot = runMockTools(normalized);
  const reasons: string[] = [];

  let score = 100;

  if (!normalized) {
    score -= 45;
    reasons.push("Prompt trong, thieu rang buoc hoc tap.");
  }

  if (
    normalized.includes("khong chac") ||
    normalized.includes("khong ro") ||
    normalized.includes("help")
  ) {
    score -= 30;
    reasons.push("User intent mo ho, can clarification truoc khi submit.");
  }

  if (!toolSnapshot.prerequisitesOk) {
    score -= 25;
    reasons.push("Tool prerequisite checker phat hien nguy co sai dieu kien.");
  }

  if (toolSnapshot.seatRisk === "medium") {
    score -= 10;
    reasons.push("Seat risk trung binh, nen giu phuong an du phong.");
  }

  if (toolSnapshot.seatRisk === "high") {
    score -= 20;
    reasons.push("Seat risk cao, can Plan B cho graceful fallback.");
  }

  if (!toolSnapshot.dataFresh) {
    score -= 25;
    reasons.push("Du lieu stale, nguy co submit that bai tang cao.");
  }

  const confidenceScore = Math.max(0, Math.min(100, score));
  const needsPlanBFallback =
    toolSnapshot.seatRisk === "high" || !toolSnapshot.dataFresh;

  if (!toolSnapshot.dataFresh || confidenceScore < 45) {
    return {
      flow: "failure",
      confidenceScore,
      reasons,
      needsPlanBFallback,
      toolSnapshot,
    };
  }

  if (confidenceScore < 80) {
    return {
      flow: "lowConfidence",
      confidenceScore,
      reasons,
      needsPlanBFallback,
      toolSnapshot,
    };
  }

  reasons.push("Confidence dat nguong auto-plan, co the tiep tuc flow binh thuong.");
  return {
    flow: "happy",
    confidenceScore,
    reasons,
    needsPlanBFallback,
    toolSnapshot,
  };
}
