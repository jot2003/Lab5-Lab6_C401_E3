"use client";

import { cn } from "@/lib/utils";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MetricItem = {
  label: string;
  value: string;
  target: string;
  status: "good" | "warning" | "danger";
};

const METRICS: MetricItem[] = [
  { label: "Độ chính xác xếp lịch", value: "89%", target: "> 85%", status: "good" },
  { label: "Tỷ lệ chỉnh sửa thủ công", value: "22%", target: "< 25%", status: "good" },
  { label: "Tỷ lệ kích hoạt Plan B", value: "17%", target: "< 15%", status: "warning" },
  { label: "Số cờ đỏ đang mở", value: "1", target: "0", status: "warning" },
  { label: "Thời gian đăng ký trung bình", value: "6 phút", target: "< 8 phút", status: "good" },
  { label: "Tín hiệu do dự thu thập", value: "127", target: "> 500/kỳ", status: "danger" },
];

const statusClasses = {
  good: "border-success/30 text-success",
  warning: "border-warning/30 text-warning",
  danger: "border-danger/30 text-danger",
};

const statusLabels = { good: "Đạt", warning: "Theo dõi", danger: "Cờ đỏ" };

export default function MetricsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <FadeIn>
        <header className="mb-6">
          <h1 className="text-lg font-medium tracking-tight leading-tight">
            Bảng chỉ số vận hành
          </h1>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Theo dõi sức khỏe hệ thống theo ngưỡng triển khai.
          </p>
        </header>
      </FadeIn>

      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => (
          <StaggerItem key={m.label}>
            <Card className="border-border/50 bg-card hover:border-border transition-colors">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground leading-normal">
                  {m.label}
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold tracking-tight">
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                  Mục tiêu: {m.target}
                </p>
                <Badge
                  variant="outline"
                  className={cn("mt-3 text-[10px] leading-normal", statusClasses[m.status])}
                >
                  {statusLabels[m.status]}
                </Badge>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
