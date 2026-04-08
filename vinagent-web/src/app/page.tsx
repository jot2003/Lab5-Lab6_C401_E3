"use client";

import { useMemo, useState } from "react";

import {
  ClarificationCard,
  type ConfidenceLevel,
  PlanCard,
  PromptInput,
  ReasoningPanel,
  Toast,
} from "@/components/vinagent-ui";
import { evaluatePlannerDecision } from "@/lib/planner";

type FlowState =
  | "idle"
  | "happy"
  | "lowConfidence"
  | "failure"
  | "recovery"
  | "escalated";

const BASE_PLAN_A = [
  "CECS101 - Giai tich 2 (Mon/Wed 09:00)",
  "CECS203 - Data Structures (Tue 13:00)",
  "CECS204 - OOP Lab (Thu 15:00)",
];

const BASE_PLAN_B = [
  "CECS101 - Giai tich 2 (Mon/Wed 14:00)",
  "CECS203 - Data Structures (Tue 15:00)",
  "CECS204 - OOP Lab (Fri 09:00)",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [flow, setFlow] = useState<FlowState>("idle");
  const [selectedPlan, setSelectedPlan] = useState<"A" | "B" | null>(null);
  const [usePlanB, setUsePlanB] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [reasonList, setReasonList] = useState<string[]>([
    "Ban yeu cau tranh lich sang va giu CECS101 trong hoc ky nay.",
    "SIS snapshot cho thay lop CECS101 sang chi con 2 cho.",
    "Confidence va fallback duoc danh dau de tranh overconfidence.",
  ]);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null,
  );

  const confidence: ConfidenceLevel = useMemo(() => {
    if (flow === "lowConfidence") return "low";
    if (flow === "failure") return "medium";
    return "high";
  }, [flow]);

  const planACourses = useMemo(() => {
    if (!isEdited) return BASE_PLAN_A;
    return [
      "CECS101 - Giai tich 2 (Mon/Wed 09:00)",
      "Break block - 30m recovery",
      "CECS203 - Data Structures (Tue 13:30)",
      "CECS204 - OOP Lab (Thu 15:00)",
    ];
  }, [isEdited]);

  const planBCourses = useMemo(() => {
    if (!isEdited) return BASE_PLAN_B;
    return [
      "CECS101 - Giai tich 2 (Mon/Wed 14:00)",
      "Break block - 30m recovery",
      "CECS203 - Data Structures (Tue 15:30)",
      "CECS204 - OOP Lab (Fri 09:00)",
    ];
  }, [isEdited]);

  function handleGenerate() {
    const decision = evaluatePlannerDecision(prompt);
    setReasonList([
      ...decision.reasons,
      `Tool snapshot: ${decision.toolSnapshot.sourceTimestamp}, data ${
        decision.toolSnapshot.dataFresh ? "fresh" : "stale"
      }.`,
    ]);

    if (decision.flow === "failure") {
      setFlow("failure");
      setUsePlanB(decision.needsPlanBFallback);
      setToast({
        title: "High risk scenario",
        message: "Plan A co the that bai do du lieu stale. Plan B da san sang.",
      });
      return;
    }

    if (decision.flow === "lowConfidence") {
      setFlow("lowConfidence");
      setUsePlanB(decision.needsPlanBFallback);
      setToast({
        title: "Low confidence detected",
        message: "Can xac nhan them preference truoc khi de xuat plan cuoi.",
      });
      return;
    }

    setFlow("happy");
    setUsePlanB(decision.needsPlanBFallback);
    setToast({
      title: "Plans generated",
      message: `Da tao 2 phuong an. Confidence score: ${decision.confidenceScore}/100.`,
    });
  }

  function handleAccept(plan: "A" | "B") {
    setSelectedPlan(plan);
    if (flow === "failure" && plan === "A") {
      setUsePlanB(true);
      setSelectedPlan("B");
      setFlow("recovery");
      setToast({
        title: "Plan B was activated",
        message:
          "Plan A that bai do het cho; he thong chuyen sang Plan B va giu dieu kien tien quyet.",
      });
      return;
    }

    setFlow("happy");
    setToast({
      title: "Registration ready",
      message: `Ban da chon Plan ${plan}. He thong san sang buoc xac nhan cuoi.`,
    });
  }

  function handleEdit() {
    setIsEdited((prev) => !prev);
    setToast({
      title: "Editable plan updated",
      message:
        "Da cap nhat lich voi break block de giam tai va tang kha nang bam lich.",
    });
  }

  function handleEscalate() {
    setFlow("escalated");
    setToast({
      title: "Escalated to advisor",
      message:
        "Advisor brief da duoc tao voi context session de co van tiep nhan nhanh hon.",
    });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          VinAgent Frontend MVP — Phase 2
        </h1>
        <p className="text-sm text-muted">
          Interactive mock flows for happy path, low-confidence clarification,
          failure fallback, and trust recovery.
        </p>
      </header>

      <PromptInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleGenerate}
      />

      <main className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Scenario Planning
          </h2>
          <PlanCard
            title="Plan A — Optimized"
            courses={planACourses}
            confidence={confidence}
            selected={selectedPlan === "A" && !usePlanB}
            onAccept={() => handleAccept("A")}
            onEdit={handleEdit}
            onEscalate={handleEscalate}
          />
          <PlanCard
            title="Plan B — Backup"
            courses={planBCourses}
            confidence={usePlanB ? "high" : "medium"}
            hasConflict={!usePlanB}
            selected={selectedPlan === "B"}
            onAccept={() => handleAccept("B")}
            onEdit={handleEdit}
            onEscalate={handleEscalate}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Trust & Recovery
          </h2>
          <ReasoningPanel
            reasons={reasonList}
          />
          {(flow === "lowConfidence" || flow === "idle") && (
            <ClarificationCard
              onChoose={(choice) => {
                setFlow("happy");
                setToast({
                  title: "Preference captured",
                  message:
                    choice === "avoidMorning"
                      ? "He thong uu tien cac lop sau 9h00."
                      : "He thong uu tien giu lich hoc cung nhom ban.",
                });
              }}
            />
          )}
          {toast && <Toast title={toast.title} message={toast.message} />}
        </section>
      </main>

      <footer className="border-t pt-4 text-xs text-muted">
        Phase 2 focus: full interactive mock flows, editable planning, fallback
        behavior, and friendly trust UX.
      </footer>
    </div>
  );
}
