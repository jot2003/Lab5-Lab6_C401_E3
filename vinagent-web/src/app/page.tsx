"use client";

import Link from "next/link";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

const FLOW_CARDS = [
  {
    title: "Khởi tạo yêu cầu",
    description:
      "Sinh viên nhập mục tiêu học kỳ và ràng buộc cá nhân bằng ngôn ngữ tự nhiên.",
    href: "/lap-ke-hoach",
    cta: "Bắt đầu lập kế hoạch",
    icon: "📋",
    step: 1,
  },
  {
    title: "Đánh giá độ tin cậy",
    description:
      "Hệ thống hiển thị suy luận, cờ đỏ và yêu cầu làm rõ khi confidence thấp.",
    href: "/do-tin-cay",
    cta: "Xem màn độ tin cậy",
    icon: "🛡️",
    step: 2,
  },
  {
    title: "Theo dõi chỉ số",
    description:
      "Giám sát precision, edit rate, Plan B activation và tình trạng red flags.",
    href: "/chi-so",
    cta: "Mở bảng chỉ số",
    icon: "📊",
    step: 3,
  },
];

const FEATURES = [
  { icon: "🤖", label: "Agentic AI", desc: "LangGraph orchestration" },
  { icon: "🔄", label: "Plan A/B", desc: "Auto-fallback & recovery" },
  { icon: "🎯", label: "Confidence Scoring", desc: "Minh bạch mọi quyết định" },
  { icon: "⚡", label: "Real-time", desc: "SIS data integration" },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <FadeIn>
        <header className="gradient-hero relative overflow-hidden rounded-3xl border p-8 md:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-8 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-success/10 blur-3xl" />
          <div className="relative z-10">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              VinAgent v2.0 — Cố vấn học vụ AI
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              <span className="gradient-text">Cố vấn học vụ tự nhiên,</span>
              <br />
              dễ dùng theo từng bước
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
              Hệ thống agentic AI giúp sinh viên VinUni tối ưu đăng ký môn học.
              Từ nhập yêu cầu, tạo phương án A/B, xử lý rủi ro đến giám sát chỉ số
              — mọi quyết định đều minh bạch và có thể kiểm chứng.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/lap-ke-hoach"
                className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold"
              >
                Bắt đầu ngay
              </Link>
              <Link
                href="/do-tin-cay"
                className="rounded-xl border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                Xem tính năng tin cậy
              </Link>
            </div>
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.label} className="card-glass rounded-xl border p-4 text-center">
              <span className="text-2xl">{f.icon}</span>
              <p className="mt-2 text-xs font-bold">{f.label}</p>
              <p className="mt-0.5 text-[11px] text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 md:grid-cols-3">
        {FLOW_CARDS.map((card) => (
          <StaggerItem key={card.title}>
            <article className="card-surface group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[image:var(--gradient-primary)] opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
                  {card.icon}
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/5 text-xs font-bold text-muted">
                  {card.step}
                </span>
              </div>
              <h2 className="text-base font-bold">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
              <Link
                href={card.href}
                className="btn-primary mt-5 inline-flex rounded-xl px-4 py-2.5 text-xs font-semibold"
              >
                {card.cta}
              </Link>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
