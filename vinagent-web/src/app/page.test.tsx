import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Landing page", () => {
  it("renders flow overview and navigation cards", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", {
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Bắt đầu lập kế hoạch/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Xem màn độ tin cậy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mở bảng chỉ số/i })).toBeInTheDocument();
  });

  it("passes accessibility smoke test", async () => {
    const { container } = render(<Home />);
    const results = await axe(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });
    const blockingViolations = results.violations.filter((violation) =>
      violation.nodes.some((node) =>
        ["critical", "serious"].includes(node.impact ?? ""),
      ),
    );
    expect(blockingViolations).toHaveLength(0);
  });
});
