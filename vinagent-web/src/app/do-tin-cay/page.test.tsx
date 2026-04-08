import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { useVinAgent } from "@/lib/store";

import TrustPage from "./page";

beforeEach(() => {
  useVinAgent.setState({
    redFlags: ["Dữ liệu SIS đã cũ.", "Rủi ro hết chỗ cao."],
    confidenceScore: 74,
    autoActionEnabled: false,
  });
});

describe("Trust page", () => {
  it("renders trust control and red flags", () => {
    render(<TrustPage />);
    expect(
      screen.getByRole("heading", { name: /Độ tin cậy và khôi phục niềm tin/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Điều khiển tin cậy/i)).toBeInTheDocument();
  });

  it("blocks auto action when conditions not met", () => {
    render(<TrustPage />);
    fireEvent.click(screen.getByRole("button", { name: /Tự động hành động: TẮT/i }));
    expect(screen.getByText(/Chưa đủ điều kiện/i)).toBeInTheDocument();
  });
});
