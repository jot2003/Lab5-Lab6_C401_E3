import { cn } from "@/lib/cn";

export type ConfidenceLevel = "high" | "medium" | "low";

export function ConflictBadge({ hasConflict }: { hasConflict: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        hasConflict
          ? "border-danger/30 bg-danger/8 text-danger"
          : "border-success/30 bg-success/8 text-success",
      )}
    >
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", hasConflict ? "bg-danger" : "bg-success")} />
      {hasConflict ? "Có xung đột" : "Không xung đột"}
    </span>
  );
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const labels = {
    high: "Độ tin cậy cao",
    medium: "Cần xác nhận",
    low: "Độ tin cậy thấp",
  };
  const classes = {
    high: "border-trust-high/30 bg-trust-high/8 text-trust-high",
    medium: "border-trust-mid/30 bg-trust-mid/8 text-trust-mid",
    low: "border-trust-low/30 bg-trust-low/8 text-trust-low",
  };
  const dotClasses = {
    high: "bg-trust-high",
    medium: "bg-trust-mid",
    low: "bg-trust-low",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        classes[level],
      )}
    >
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full animate-pulse", dotClasses[level])} />
      {labels[level]}
    </span>
  );
}

export function SourceChip({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-muted">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      {source}
    </span>
  );
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="card-glass flex w-full flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="prompt" className="sr-only">
        Nhập yêu cầu cho VinAgent
      </label>
      <div className="relative flex-1">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="prompt"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ví dụ: Lên lịch HK Xuân 2026, tránh sáng, phải có Giải tích 2"
          className="w-full rounded-xl border bg-background/60 py-3 pl-10 pr-4 text-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold"
      >
        Tạo kế hoạch
      </button>
    </form>
  );
}

export function PlanCard({
  title,
  courses,
  confidence,
  hasConflict = false,
  selected = false,
  onAccept,
  onEdit,
  onEscalate,
}: {
  title: string;
  courses: string[];
  confidence: ConfidenceLevel;
  hasConflict?: boolean;
  selected?: boolean;
  onAccept?: () => void;
  onEdit?: () => void;
  onEscalate?: () => void;
}) {
  return (
    <article
      className={cn(
        "card-surface group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]",
        selected && "ring-2 ring-primary/50 border-primary/30",
      )}
    >
      {selected && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-[image:var(--gradient-primary)]" />
      )}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold">{title}</h3>
        <div className="flex items-center gap-2">
          <ConflictBadge hasConflict={hasConflict} />
          <ConfidenceBadge level={confidence} />
        </div>
      </header>
      <ul className="mb-5 space-y-2 text-sm">
        {courses.map((course, idx) => (
          <li key={course} className="flex items-center gap-2 rounded-xl border bg-background/60 px-3.5 py-2.5 text-muted transition-colors group-hover:text-foreground">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
              {idx + 1}
            </span>
            {course}
          </li>
        ))}
      </ul>
      <ActionBar onAccept={onAccept} onEdit={onEdit} onEscalate={onEscalate} />
    </article>
  );
}

export function ReasoningPanel({ reasons }: { reasons: string[] }) {
  return (
    <section className="card-glass rounded-2xl border p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10 text-xs">🧠</span>
        <h3 className="text-sm font-bold">Cách hệ thống suy luận</h3>
      </div>
      <ul className="space-y-2 text-sm text-muted">
        {reasons.map((reason, idx) => (
          <li key={reason} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
              {idx + 1}
            </span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <SourceChip source="SIS Snapshot 10:32" />
        <SourceChip source="Quy định học vụ CECS" />
      </div>
    </section>
  );
}

export function ClarificationCard({
  onChoose,
}: {
  onChoose: (choice: "avoidMorning" | "keepGroup") => void;
}) {
  return (
    <section className="card-glass rounded-2xl border border-warning/30 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-warning/10 text-xs">💡</span>
        <h3 className="text-sm font-bold text-warning">Cần làm rõ thêm</h3>
      </div>
      <p className="mb-4 text-sm text-muted">
        Bạn ưu tiên tránh lịch sáng hay giữ lớp cùng nhóm bạn?
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChoose("avoidMorning")}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          🌅 Tránh lịch sáng
        </button>
        <button
          type="button"
          onClick={() => onChoose("keepGroup")}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          👥 Giữ lớp cùng nhóm
        </button>
      </div>
    </section>
  );
}

export function ActionBar({
  onAccept,
  onEdit,
  onEscalate,
}: {
  onAccept?: () => void;
  onEdit?: () => void;
  onEscalate?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onAccept}
        className="btn-primary rounded-xl px-4 py-2.5 text-xs font-semibold"
      >
        Xác nhận Plan
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        Chỉnh sửa kế hoạch
      </button>
      <button
        type="button"
        onClick={onEscalate}
        className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-danger/40 hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger/20"
      >
        Chuyển cố vấn học vụ
      </button>
    </div>
  );
}

export function Toast({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <aside className="card-glass rounded-xl border border-success/30 bg-success/5 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-[10px]">✓</span>
        <p className="text-sm font-bold text-success">{title}</p>
      </div>
      <p className="mt-1 pl-7 text-xs text-muted">{message}</p>
    </aside>
  );
}

export type MetricCardItem = {
  label: string;
  value: string;
  status: "good" | "warning" | "danger";
  target: string;
};

export function MetricsPanel({ metrics }: { metrics: MetricCardItem[] }) {
  const icons = { good: "✅", warning: "⚠️", danger: "🔴" };
  return (
    <section className="card-glass rounded-2xl border p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs">📊</span>
        <h3 className="text-sm font-bold">Bảng chỉ số vận hành</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="group relative overflow-hidden rounded-xl border bg-background/60 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted">{metric.label}</p>
              <span className="text-sm">{icons[metric.status]}</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{metric.value}</p>
            <p className="mt-1 text-xs text-muted">Mục tiêu: {metric.target}</p>
            <p
              className={cn(
                "mt-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                metric.status === "good" &&
                  "border-success/30 bg-success/8 text-success",
                metric.status === "warning" &&
                  "border-trust-mid/30 bg-trust-mid/8 text-trust-mid",
                metric.status === "danger" &&
                  "border-danger/30 bg-danger/8 text-danger",
              )}
            >
              {metric.status === "good"
                ? "Đạt mục tiêu"
                : metric.status === "warning"
                  ? "Cần theo dõi"
                  : "Cờ đỏ"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RedFlagPanel({
  flags,
  onAcknowledge,
}: {
  flags: string[];
  onAcknowledge: () => void;
}) {
  return (
    <section className="card-glass rounded-2xl border border-danger/20 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-danger/10 text-xs">🚨</span>
        <h3 className="text-sm font-bold text-danger">Cảnh báo cờ đỏ</h3>
      </div>
      {flags.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl bg-success/5 px-4 py-3">
          <span className="text-sm">✅</span>
          <p className="text-sm text-success font-medium">Không có cờ đỏ đang mở.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2 text-sm text-muted">
            {flags.map((flag) => (
              <li key={flag} className="flex items-start gap-2 rounded-xl border border-danger/10 bg-danger/5 px-3.5 py-2.5">
                <span className="mt-0.5 text-danger text-xs">●</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onAcknowledge}
            className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-xs font-semibold text-danger transition-all hover:-translate-y-0.5 hover:bg-danger/20 focus:outline-none focus:ring-2 focus:ring-danger/20"
          >
            Đánh dấu đã xử lý
          </button>
        </>
      )}
    </section>
  );
}

export function TrustControlPanel({
  autoActionEnabled,
  onToggleAutoAction,
}: {
  autoActionEnabled: boolean;
  onToggleAutoAction: () => void;
}) {
  return (
    <section className="card-glass rounded-2xl border p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs">🛡️</span>
        <h3 className="text-sm font-bold">Điều khiển tin cậy</h3>
      </div>
      <p className="mb-4 text-sm text-muted">
        Tự động hành động chỉ được bật khi độ tin cậy {"\u003e="} 80 và không có
        cờ đỏ.
      </p>
      <button
        type="button"
        onClick={onToggleAutoAction}
        className={cn(
          "rounded-xl px-5 py-3 text-xs font-semibold transition-all",
          autoActionEnabled
            ? "bg-success/15 text-success border border-success/30 hover:bg-success/25"
            : "border border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20",
        )}
      >
        {autoActionEnabled ? "✅ Tự động hành động: BẬT" : "Tự động hành động: TẮT"}
      </button>
    </section>
  );
}

export function ScenarioPresetBar({
  presets,
  onPick,
}: {
  presets: Array<{ id: string; label: string; prompt: string }>;
  onPick: (prompt: string) => void;
}) {
  const icons: Record<string, string> = { happy: "🎯", low: "🔍", fail: "⚡" };
  return (
    <section className="card-glass rounded-2xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10 text-xs">🎮</span>
        <h3 className="text-sm font-bold">Kịch bản demo nhanh</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPick(preset.prompt)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {icons[preset.id] ?? "📌"} {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function SessionSummaryCard({
  summary,
  onCopy,
}: {
  summary: string;
  onCopy: () => void;
}) {
  return (
    <section className="card-glass rounded-2xl border p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs">📋</span>
        <h3 className="text-sm font-bold">Tóm tắt phiên làm việc</h3>
      </div>
      <div className="rounded-xl border bg-background/60 px-4 py-3">
        <code className="text-xs text-muted font-mono leading-relaxed">{summary}</code>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="mt-4 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        📋 Sao chép tóm tắt
      </button>
    </section>
  );
}

export function ConfidenceMeter({ score }: { score: number }) {
  const color = score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-danger";
  const label = score >= 80 ? "An toàn" : score >= 60 ? "Cần kiểm tra" : "Rủi ro";

  return (
    <div className="card-glass rounded-2xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs">📈</span>
          <h3 className="text-sm font-bold">Điểm tin cậy</h3>
        </div>
        <span className="text-2xl font-bold tracking-tight">{score}<span className="text-sm text-muted font-normal">/100</span></span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-border/50">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{label}</p>
    </div>
  );
}
