"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Pencil, UserRound, ChevronDown, ChevronUp, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBKAgent } from "@/lib/store";
import { VisualCalendar } from "./visual-calendar";
import { CitationList } from "./citation-popover";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AdvisorBriefSheet } from "./advisor-brief-sheet";
import { EditPlanSheet } from "./edit-plan-sheet";
import { RegisterDialog } from "./register-dialog";
import { GroupInviteSheet } from "./group-invite-sheet";

function ConfidenceBar({ score }: { score: number }) {
  const label = score >= 80 ? "An toàn" : score >= 60 ? "Cần kiểm tra" : "Rủi ro";
  const trackBg = score >= 80 ? "bg-white/20" : score >= 60 ? "bg-white/20" : "bg-white/20";
  const thumbColor = score >= 80 ? "[&>div]:bg-white" : score >= 60 ? "[&>div]:bg-yellow-300" : "[&>div]:bg-red-300";

  return (
    <div className="rounded-lg bg-primary text-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <span className="text-sm font-bold text-white">Độ tin cậy</span>
          <p className="text-xs text-white/70 mt-0.5">{label}</p>
        </div>
        <span className="font-mono text-3xl font-bold text-white">
          {score}<span className="text-sm font-normal text-white/70">/100</span>
        </span>
      </div>
      <Progress value={score} className={cn("h-1.5 rounded-none", trackBg, thumbColor)} />
    </div>
  );
}

function RedFlagBanner({ flags, onAcknowledge }: { flags: string[]; onAcknowledge: () => void }) {
  if (flags.length === 0) return null;
  return (
    <Alert variant="destructive" className="border-danger/20 bg-danger/5">
      <AlertTriangle className="size-4" />
      <AlertTitle className="text-xs font-semibold leading-normal">
        Cảnh báo ({flags.length})
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-1 space-y-1">
          {flags.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-danger" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 text-[11px] border-danger/30 text-danger hover:bg-danger/10"
          onClick={onAcknowledge}
        >
          Đánh dấu đã xử lý
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function PlanListView({ courses, plan }: { courses: { code: string; name: string; day: string; startHour: number; endHour: number; room?: string }[]; plan: "A" | "B" }) {
  return (
    <div className="space-y-2">
      {courses.map((c, idx) => (
        <div key={`${plan}-${c.code}-${c.day}-${idx}`} className="flex items-center gap-3 rounded-lg border border-border bg-white shadow-sm p-3">
          <span className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
            plan === "A" ? "bg-primary text-white" : "bg-gold text-foreground",
          )}>
            {c.code.slice(-3)}
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm font-bold leading-normal", plan === "A" ? "text-primary" : "text-[oklch(0.65_0.15_86)]")}>
              {c.code} — {c.name}
            </p>
            <p className="text-xs text-muted-foreground leading-normal">
              {c.day} {c.startHour}:00–{c.endHour > Math.floor(c.endHour) ? `${Math.floor(c.endHour)}:30` : `${c.endHour}:00`} · {c.room}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReasoningPanel({ reasons, citations }: { reasons: { text: string; citationIds: number[] }[]; citations: import("@/lib/citations").Citation[] }) {
  const [open, setOpen] = useState(false);
  if (reasons.length === 0) return null;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors">
        <span>Lý luận AI ({reasons.length} bước)</span>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 space-y-2.5 rounded-md border border-primary/20 bg-primary/5 p-3">
          {reasons.map((r, i) => {
            const cit = citations.find((c) => r.citationIds.includes(c.id));
            return (
              <div key={i} className="flex gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {r.text}
                  {cit && (
                    <span className="ml-1 rounded-sm bg-primary px-1.5 py-0.5 text-xs font-bold text-white">
                      {cit.title}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ResultPanel() {
  const store = useBKAgent();
  const hasResult = store.flow !== "idle";

  useEffect(() => {
    if (store.toast) {
      toast(store.toast.title, { description: store.toast.message });
    }
  }, [store.toast]);

  if (!hasResult) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-8">
        <div className="rounded-lg border-2 border-dashed border-border/40 p-8">
          <p className="text-sm font-medium text-muted-foreground">Lịch học sẽ hiển thị ở đây</p>
          <p className="mt-1 text-xs text-muted-foreground">Nhập yêu cầu ở khung chat bên trái để bắt đầu</p>
        </div>
      </div>
    );
  }

  const canRegister = store.selectedPlan !== null && store.confidenceScore >= 80;

  return (
    <>
      <AdvisorBriefSheet />
      <EditPlanSheet />
      <RegisterDialog />
      <GroupInviteSheet />

      {/* Split: main calendar area + right info sidebar */}
      <div className="flex h-full overflow-hidden">

        {/* ── Main calendar/list column ── */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5 shrink-0">
            <Tabs value={store.currentView} onValueChange={(v) => store.setCurrentView(v as "calendar" | "list")}>
              <TabsList className="h-7 bg-primary/10 border border-primary/20">
                <TabsTrigger
                  value="calendar"
                  className="text-xs px-2.5 text-primary/70 data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Lịch học
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="text-xs px-2.5 text-primary/70 data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Danh sách
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-1">
              <Button
                size="sm"
                className={cn(
                  "text-xs h-7 transition-colors",
                  store.selectedPlan === "A"
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-transparent border border-primary/30 text-primary hover:bg-primary hover:text-white"
                )}
                onClick={() => store.acceptPlan("A")}
              >
                Plan A
              </Button>
              <Button
                size="sm"
                className={cn(
                  "text-xs h-7 transition-colors",
                  store.selectedPlan === "B"
                    ? "bg-gold text-foreground hover:bg-gold/90"
                    : "bg-transparent border border-primary/30 text-primary hover:bg-gold hover:text-foreground"
                )}
                onClick={() => store.acceptPlan("B")}
              >
                Plan B
              </Button>
            </div>
          </div>

          {/* Scrollable calendar/list area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "oklch(0.6 0.16 23 / 0.3) transparent" }}
          >
            {store.planACourses.length === 0 && store.planBCourses.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
                Agent đang tạo kế hoạch...
              </div>
            ) : store.currentView === "calendar" ? (
              <VisualCalendar
                planA={store.planACourses}
                planB={store.planBCourses}
                showPlanB={store.usePlanB || store.flow === "failure" || store.flow === "recovery"}
                selectedPlan={store.selectedPlan}
              />
            ) : (
              <div className="space-y-4">
                {store.planACourses.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-primary uppercase tracking-wide">
                      Plan A — Tối ưu
                    </h4>
                    <PlanListView courses={store.planACourses} plan="A" />
                  </div>
                )}
                {store.planBCourses.length > 0 && (store.usePlanB || store.flow === "failure" || store.flow === "recovery") && (
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-primary uppercase tracking-wide">
                      Plan B — Dự phòng
                    </h4>
                    <PlanListView courses={store.planBCourses} plan="B" />
                  </div>
                )}
              </div>
            )}

            <ReasoningPanel reasons={store.reasons} citations={store.citations} />
            <RedFlagBanner flags={store.redFlags} onAcknowledge={store.acknowledgeFlags} />
          </div>{/* end scrollable area */}
        </div>{/* end main column */}

        {/* ── Right info sidebar ── */}
        <div
          className="w-[200px] shrink-0 border-l border-border/50 flex flex-col overflow-y-auto bg-card/50"
          style={{ scrollbarWidth: "thin", scrollbarColor: "oklch(0.6 0.16 23 / 0.2) transparent" }}
        >
          <div className="p-3 space-y-3">
            <ConfidenceBar score={store.confidenceScore} />

            {store.citations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-0.5">
                  Nguồn tham khảo
                </p>
                {store.citations.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-primary/15 bg-primary/5 p-2 text-[10px] leading-snug"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded bg-primary text-[9px] font-bold text-white">
                        {c.id}
                      </span>
                      <span className="text-primary font-semibold truncate">{c.title}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">{c.detail}</p>
                  </div>
                ))}
              </div>
            )}

            <Separator className="opacity-20" />

            <div className="space-y-1.5">
              {canRegister && (
                <Button
                  size="sm"
                  className="w-full text-xs gap-1.5 bg-primary text-white hover:bg-primary/90 h-8"
                  onClick={() => store.openRegisterDialog()}
                >
                  <CheckCircle2 className="size-3" />
                  Đăng ký ngay
                </Button>
              )}
              {store.planACourses.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5 h-8"
                  onClick={() => store.openGroupInvite()}
                >
                  <Users className="size-3" />
                  Mời bạn cùng đăng ký
                </Button>
              )}
              {store.selectedPlan && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5 h-8"
                  onClick={() => store.openEditPlan()}
                >
                  <Pencil className="size-3" />
                  Chỉnh sửa plan
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-danger gap-1.5 h-8"
                onClick={store.escalate}
              >
                <UserRound className="size-3" />
                Cố vấn học vụ
              </Button>
            </div>
          </div>
        </div>{/* end right sidebar */}

      </div>{/* end split row */}
    </>
  );
}
