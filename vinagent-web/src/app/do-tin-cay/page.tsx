"use client";

import { useMemo } from "react";

import {
  ConfidenceMeter,
  RedFlagPanel,
  ReasoningPanel,
  SessionSummaryCard,
  Toast,
  TrustControlPanel,
} from "@/components/vinagent-ui";
import { StepWizard } from "@/components/step-wizard";
import { FadeIn, SlideIn } from "@/components/motion";
import { useVinAgent } from "@/lib/store";

export default function TrustPage() {
  const store = useVinAgent();

  const summary = useMemo(
    () =>
      `confidence=${store.confidenceScore} | autoAction=${
        store.autoActionEnabled ? "bật" : "tắt"
      } | redFlags=${store.redFlags.length} | plan=${store.selectedPlan ?? "chưa chọn"}`,
    [store.autoActionEnabled, store.confidenceScore, store.redFlags.length, store.selectedPlan],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <FadeIn>
        <StepWizard />
      </FadeIn>

      <FadeIn delay={0.08}>
        <header className="gradient-hero relative overflow-hidden rounded-3xl border p-6 md:p-8">
          <div className="pointer-events-none absolute -bottom-10 right-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Độ tin cậy và khôi phục niềm tin
            </h1>
            <p className="mt-2 text-sm text-muted">
              Kiểm tra cờ đỏ, xem suy luận và quyết định có bật tự động hành
              động hay không.
            </p>
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={0.15}>
        <ConfidenceMeter score={store.confidenceScore} />
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <SlideIn from="left" delay={0.1}>
          <ReasoningPanel
            reasons={
              store.reasons.length > 1
                ? store.reasons
                : [
                    "Hệ thống ưu tiên lớp không xung đột và đáp ứng điều kiện tiên quyết.",
                    "Nguồn SIS hiện có dấu hiệu trễ cập nhật ở giờ cao điểm.",
                    "Plan B được giữ để fallback khi Plan A submit thất bại.",
                  ]
            }
          />
        </SlideIn>
        <SlideIn from="right" delay={0.15}>
          <TrustControlPanel
            autoActionEnabled={store.autoActionEnabled}
            onToggleAutoAction={store.toggleAutoAction}
          />
        </SlideIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SlideIn from="left" delay={0.2}>
          <RedFlagPanel
            flags={store.redFlags}
            onAcknowledge={store.acknowledgeFlags}
          />
        </SlideIn>
        <SlideIn from="right" delay={0.25}>
          <SessionSummaryCard
            summary={summary}
            onCopy={async () => {
              await navigator.clipboard.writeText(summary);
              store.setToast({
                title: "Đã sao chép tóm tắt",
                message: "Dùng tóm tắt này để gửi cho cố vấn học vụ.",
              });
            }}
          />
        </SlideIn>
      </div>

      {store.toast && (
        <FadeIn>
          <Toast title={store.toast.title} message={store.toast.message} />
        </FadeIn>
      )}
    </div>
  );
}
