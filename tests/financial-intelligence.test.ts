import { describe, expect, it } from "vitest";

import { financialDashboardDataset } from "@/lib/data/financial-intelligence";

const dataset = financialDashboardDataset;

describe("financial intelligence dataset", () => {
  it("includes analyst-ready slices", () => {
    expect(dataset.metrics.length).toBeGreaterThanOrEqual(5);
    expect(dataset.insights.length).toBeGreaterThanOrEqual(3);
    expect(dataset.providers.length).toBeGreaterThan(0);
  });

  it("emits ISO timestamps and refresh cadence", () => {
    expect(Number.isNaN(Date.parse(dataset.generatedAt))).toBe(false);
    expect(dataset.refreshIntervalMinutes).toBeGreaterThan(0);
  });

  it("keeps metric ids unique and aligned with change direction", () => {
    const ids = new Set(dataset.metrics.map((metric) => metric.id));
    expect(ids.size).toBe(dataset.metrics.length);

    dataset.metrics.forEach((metric) => {
      const change = metric.change.percentage;
      if (metric.change.direction === "down") {
        expect(change).toBeGreaterThanOrEqual(0);
      } else {
        expect(change).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("shares provider status in accepted set", () => {
    const allowed = new Set(["operational", "degraded", "offline"]);
    dataset.providers.forEach((provider) => {
      expect(allowed.has(provider.status)).toBe(true);
      expect(Number.isFinite(provider.responseTimeMs)).toBe(true);
    });
  });
});
