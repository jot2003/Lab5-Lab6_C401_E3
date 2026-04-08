"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const STEPS = [
  { href: "/lap-ke-hoach", label: "Lập kế hoạch", step: 1, icon: "📋" },
  { href: "/do-tin-cay", label: "Độ tin cậy", step: 2, icon: "🛡️" },
  { href: "/chi-so", label: "Chỉ số", step: 3, icon: "📊" },
];

export function StepWizard() {
  const pathname = usePathname();
  const currentIdx = STEPS.findIndex((s) => s.href === pathname);

  return (
    <nav aria-label="Tiến trình" className="card-glass rounded-2xl border p-4">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((step, idx) => {
          const done = currentIdx > idx;
          const active = currentIdx === idx;
          return (
            <li key={step.href} className="flex flex-1 items-center gap-2">
              <Link
                href={step.href}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                  active && "btn-primary shadow-md",
                  done && "bg-success/10 text-success",
                  !active && !done && "text-muted hover:bg-background",
                )}
              >
                <span className="text-base">{step.icon}</span>
                <span className="hidden sm:inline">
                  Bước {step.step}: {step.label}
                </span>
                <span className="sm:hidden">{step.step}</span>
              </Link>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden h-0.5 w-6 shrink-0 rounded-full sm:block",
                    done ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
