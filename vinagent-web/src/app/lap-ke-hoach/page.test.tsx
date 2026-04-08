import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PlannerPage from "./page";

describe("Planner page", () => {
  it("renders planner sections", () => {
    render(<PlannerPage />);
    expect(
      screen.getByRole("heading", { name: /Lập kế hoạch học tập/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Phương án đăng ký/i)).toBeInTheDocument();
    expect(screen.getByText(/Giải thích nhanh/i)).toBeInTheDocument();
  });

  it("handles low confidence and fallback interactions", () => {
    render(<PlannerPage />);
    fireEvent.change(screen.getByRole("textbox", { name: /Nhập yêu cầu/i }), {
      target: { value: "high risk stale" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Tạo kế hoạch/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Xác nhận Plan/i })[0]);
    expect(screen.getByText(/Đã kích hoạt Plan B/i)).toBeInTheDocument();
  });
});
