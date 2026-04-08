"use client";

import { ConfidenceMeter, MetricsPanel } from "@/components/vinagent-ui";
import { StepWizard } from "@/components/step-wizard";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { useVinAgent } from "@/lib/store";

const METRICS = [
  {
    label: "Độ chính xác xếp lịch",
    value: "89%",
    target: "> 85%",
    status: "good" as const,
  },
  {
    label: "Tỷ lệ chỉnh sửa thủ công",
    value: "22%",
    target: "< 25%",
    status: "good" as const,
  },
  {
    label: "Tỷ lệ kích hoạt Plan B",
    value: "17%",
    target: "< 15%",
    status: "warning" as const,
  },
  {
    label: "Số cờ đỏ đang mở",
    value: "1",
    target: "0",
    status: "warning" as const,
  },
];

const INSIGHTS = [
  { icon: "📈", text: "Độ chính xác tăng 3% so với tuần trước nhờ cập nhật dữ liệu SIS." },
  { icon: "⚡", text: "Plan B activation giảm nếu triển khai push notification seat alert." },
  { icon: "🔍", text: "Cần theo dõi thêm edit rate trong 48h tới." },
];

export default function MetricsPage() {
  const store = useVinAgent();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <FadeIn>
        <StepWizard />
      </FadeIn>

      <FadeIn delay={0.08}>
        <header className="gradient-hero relative overflow-hidden rounded-3xl border p-6 md:p-8">
          <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-success/15 blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Bảng chỉ số vận hành
            </h1>
            <p className="mt-2 text-sm text-muted">
              Theo dõi sức khỏe hệ thống và red flags theo ngưỡng deploy.
            </p>
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={0.15}>
        <ConfidenceMeter score={store.confidenceScore} />
      </FadeIn>

      <FadeIn delay={0.2}>
        <MetricsPanel metrics={METRICS} />
      </FadeIn>

      <Stagger className="grid gap-3 md:grid-cols-3">
        {INSIGHTS.map((insight) => (
          <StaggerItem key={insight.text}>
            <div className="card-glass rounded-2xl border p-5 transition-all hover:-translate-y-0.5">
              <span className="text-xl">{insight.icon}</span>
              <p className="mt-2 text-sm leading-relaxed text-muted">{insight.text}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
