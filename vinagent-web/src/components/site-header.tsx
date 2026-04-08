"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/", label: "Tổng quan", icon: "🏠" },
  { href: "/lap-ke-hoach", label: "Lập kế hoạch", icon: "📋" },
  { href: "/do-tin-cay", label: "Độ tin cậy", icon: "🛡️" },
  { href: "/chi-so", label: "Chỉ số", icon: "📊" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-[var(--surface-glass)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-xs font-bold text-white shadow-sm">
            V
          </span>
          <span className="text-sm font-bold tracking-wide">VinAgent</span>
        </Link>
        <nav className="flex flex-wrap gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                  active
                    ? "btn-primary shadow-sm"
                    : "text-muted hover:bg-background hover:text-foreground",
                )}
              >
                <span className="text-[13px]">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
