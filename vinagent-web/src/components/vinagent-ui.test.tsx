import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

import {
  ClarificationCard,
  ConfidenceBadge,
  MetricsPanel,
  PlanCard,
  PromptInput,
  RedFlagPanel,
  ReasoningPanel,
  ScenarioPresetBar,
  SessionSummaryCard,
  Toast,
  TrustControlPanel,
} from "./vinagent-ui";

describe("VinAgent UI components", () => {
  it("renders prompt input and button", () => {
    render(<PromptInput value="" onChange={() => undefined} onSubmit={() => undefined} />);
    expect(screen.getByPlaceholderText(/Lên lịch HK Xuân/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tạo kế hoạch/i }),
    ).toBeInTheDocument();
  });

  it("renders high and low confidence labels", () => {
    const { rerender } = render(<ConfidenceBadge level="high" />);
    expect(screen.getByText(/Độ tin cậy cao/i)).toBeInTheDocument();
    rerender(<ConfidenceBadge level="low" />);
    expect(screen.getByText(/Độ tin cậy thấp/i)).toBeInTheDocument();
  });

  it("renders plan card content and actions", () => {
    render(
      <PlanCard
        title="Plan A"
        confidence="medium"
        courses={["CECS101", "CECS204"]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Plan A" })).toBeInTheDocument();
    expect(screen.getByText("CECS101")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Xác nhận Plan/i })).toBeInTheDocument();
  });

  it("renders trust recovery cards", () => {
    const onChoose = vi.fn();
    render(
      <>
        <ReasoningPanel reasons={["Ly do 1", "Ly do 2"]} />
        <ClarificationCard onChoose={onChoose} />
        <Toast title="Hoàn tất" message="Thông báo" />
      </>,
    );
    expect(screen.getByText(/Cách hệ thống suy luận/i)).toBeInTheDocument();
    expect(screen.getByText(/Cần làm rõ thêm/i)).toBeInTheDocument();
    expect(screen.getByText("Hoàn tất")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tránh lịch sáng/i }));
    expect(onChoose).toHaveBeenCalled();
  });

  it("renders metrics and trust controls", () => {
    const onAcknowledge = vi.fn();
    const onToggleAutoAction = vi.fn();
    render(
      <>
        <MetricsPanel
          metrics={[
            {
              label: "Độ chính xác xếp lịch",
              value: "88%",
              status: "good",
              target: "> 85%",
            },
          ]}
        />
        <RedFlagPanel flags={["Dữ liệu cũ"]} onAcknowledge={onAcknowledge} />
        <TrustControlPanel
          autoActionEnabled={false}
          onToggleAutoAction={onToggleAutoAction}
        />
      </>,
    );
    expect(screen.getByText(/Bảng chỉ số vận hành/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Đánh dấu đã xử lý/i }));
    expect(onAcknowledge).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Tự động hành động: TẮT/i }));
    expect(onToggleAutoAction).toHaveBeenCalledTimes(1);
  });

  it("renders preset bar and session summary actions", () => {
    const onPick = vi.fn();
    const onCopy = vi.fn();
    render(
      <>
        <ScenarioPresetBar
          presets={[
            { id: "h", label: "Happy path", prompt: "happy prompt" },
            { id: "l", label: "Độ tin cậy thấp", prompt: "help" },
          ]}
          onPick={onPick}
        />
        <SessionSummaryCard summary="flow=happy" onCopy={onCopy} />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Happy path|Luồng thuận lợi/i }));
    expect(onPick).toHaveBeenCalledWith("happy prompt");
    fireEvent.click(screen.getByRole("button", { name: /Sao chép tóm tắt/i }));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("passes accessibility smoke test", async () => {
    const { container } = render(
      <>
        <PromptInput value="" onChange={() => undefined} onSubmit={() => undefined} />
        <PlanCard
          title="Plan A"
          confidence="high"
          courses={["CECS101", "CECS204"]}
        />
        <MetricsPanel
          metrics={[
            {
              label: "Schedule Precision Rate",
              value: "88%",
              status: "good",
              target: "> 85%",
            },
          ]}
        />
        <SessionSummaryCard summary="flow=happy" onCopy={() => undefined} />
      </>,
    );
    const results = await axe(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });
    expect(results.violations).toHaveLength(0);
  });
});
