"use client";

import { useMemo } from "react";

import {
  ClarificationCard,
  ConfidenceMeter,
  PlanCard,
  PromptInput,
  ReasoningPanel,
  ScenarioPresetBar,
  Toast,
} from "@/components/vinagent-ui";
import { StepWizard } from "@/components/step-wizard";
import { FadeIn, SlideIn } from "@/components/motion";
import { useVinAgent } from "@/lib/store";

const BASE_PLAN_A = [
  "CECS101 - Giải tích 2 (Mon/Wed 09:00)",
  "CECS203 - Data Structures (Tue 13:00)",
  "CECS204 - OOP Lab (Thu 15:00)",
];

const BASE_PLAN_B = [
  "CECS101 - Giải tích 2 (Mon/Wed 14:00)",
  "CECS203 - Data Structures (Tue 15:00)",
  "CECS204 - OOP Lab (Fri 09:00)",
];

const PRESETS = [
  {
    id: "happy",
    label: "Luồng thuận lợi",
    prompt: "len lich hk xuan 2026 tranh sang va co giai tich 2",
  },
  { id: "low", label: "Độ tin cậy thấp", prompt: "help" },
  { id: "fail", label: "Lỗi và dự phòng", prompt: "high risk stale near full" },
];

export default function PlannerPage() {
  const store = useVinAgent();

  const planACourses = useMemo(() => {
    if (!store.isEdited) return BASE_PLAN_A;
    return [
      "CECS101 - Giải tích 2 (Mon/Wed 09:00)",
      "Nghỉ đệm - 30 phút",
      "CECS203 - Data Structures (Tue 13:30)",
      "CECS204 - OOP Lab (Thu 15:00)",
    ];
  }, [store.isEdited]);

  const planBCourses = useMemo(() => {
    if (!store.isEdited) return BASE_PLAN_B;
    return [
      "CECS101 - Giải tích 2 (Mon/Wed 14:00)",
      "Nghỉ đệm - 30 phút",
      "CECS203 - Data Structures (Tue 15:30)",
      "CECS204 - OOP Lab (Fri 09:00)",
    ];
  }, [store.isEdited]);

  const confidence = store.confidenceLevel();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <FadeIn>
        <StepWizard />
      </FadeIn>

      <FadeIn delay={0.08}>
        <header className="gradient-hero relative overflow-hidden rounded-3xl border p-6 md:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Lập kế hoạch học tập
            </h1>
            <p className="mt-2 text-sm text-muted">
              Nhập mục tiêu học kỳ và tạo phương án Plan A/Plan B tự động.
            </p>
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={0.15}>
        <PromptInput
          value={store.prompt}
          onChange={store.setPrompt}
          onSubmit={() => store.generate(store.prompt)}
        />
      </FadeIn>

      <FadeIn delay={0.2}>
        <ScenarioPresetBar
          presets={PRESETS}
          onPick={(presetPrompt) => {
            store.setPrompt(presetPrompt);
            store.generate(presetPrompt);
          }}
        />
      </FadeIn>

      <main className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Phương án đăng ký
          </h2>
          <SlideIn from="left" delay={0.1}>
            <PlanCard
              title="Plan A — Tối ưu"
              courses={planACourses}
              confidence={confidence}
              selected={store.selectedPlan === "A" && !store.usePlanB}
              onAccept={() => store.acceptPlan("A")}
              onEdit={store.toggleEdit}
              onEscalate={store.escalate}
            />
          </SlideIn>
          <SlideIn from="left" delay={0.2}>
            <PlanCard
              title="Plan B — Dự phòng"
              courses={planBCourses}
              confidence={store.usePlanB ? "high" : "medium"}
              hasConflict={!store.usePlanB}
              selected={store.selectedPlan === "B"}
              onAccept={() => store.acceptPlan("B")}
              onEdit={store.toggleEdit}
              onEscalate={store.escalate}
            />
          </SlideIn>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Giải thích nhanh
          </h2>
          <SlideIn from="right" delay={0.1}>
            <ConfidenceMeter score={store.confidenceScore} />
          </SlideIn>
          <SlideIn from="right" delay={0.2}>
            <ReasoningPanel reasons={store.reasons} />
          </SlideIn>
          {(store.flow === "lowConfidence" || store.flow === "idle") && (
            <SlideIn from="right" delay={0.3}>
              <ClarificationCard onChoose={store.clarify} />
            </SlideIn>
          )}
          {store.toast && (
            <FadeIn delay={0.1}>
              <Toast title={store.toast.title} message={store.toast.message} />
            </FadeIn>
          )}
        </section>
      </main>
    </div>
  );
}
