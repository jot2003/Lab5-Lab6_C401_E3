import { describe, expect, it } from "vitest";

import { evaluatePlannerDecision } from "./planner";

describe("evaluatePlannerDecision", () => {
  it("returns low confidence for empty prompt", () => {
    const decision = evaluatePlannerDecision("");
    expect(decision.flow).toBe("lowConfidence");
    expect(decision.confidenceScore).toBeLessThan(80);
  });

  it("returns failure for stale high risk prompt", () => {
    const decision = evaluatePlannerDecision("high risk stale schedule");
    expect(decision.flow).toBe("failure");
    expect(decision.needsPlanBFallback).toBe(true);
  });

  it("returns happy path for specific clear prompt", () => {
    const decision = evaluatePlannerDecision(
      "len lich hk xuan 2026 tranh sang va co giai tich 2",
    );
    expect(decision.flow).toBe("happy");
    expect(decision.confidenceScore).toBeGreaterThanOrEqual(80);
  });
});
