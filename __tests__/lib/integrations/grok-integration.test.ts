import { grokDefaultRisk, grokRiskSummary } from "@/lib/integrations/grok-integration";
import type { PredictionContext } from "@/lib/ml/types";
import { ContinueLearning } from "@/lib/ml/continue-learning";

jest.mock("@/lib/integrations/base-integration", () => {
  const execute = jest.fn((fn: () => Promise<unknown>) => fn());
  return {
    Integration: jest.fn().mockImplementation(() => ({
      execute,
    })),
  };
});

jest.mock("@/lib/ml/continue-learning", () => ({
  ContinueLearning: {
    recordPrediction: jest.fn().mockResolvedValue("prediction-id"),
  },
}));

const mockedRecordPrediction = ContinueLearning.recordPrediction as jest.Mock;

describe("grok integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GROK_API_KEY = "test-key";
  });

  describe("grokRiskSummary", () => {
    it("returns trimmed summary content from Grok response", async () => {
      const summary = "Portfolio is healthy.";
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: summary },
            },
          ],
        }),
      } as Response);

      const context: PredictionContext = {
        aum: 1_000_000,
        activeLoans: 250,
        avgDpd: 12,
        defaultRate: 0.04,
      };

      const result = await grokRiskSummary(context);

      expect(result).toBe(summary);
      expect(global.fetch).toHaveBeenCalledWith("https://api.x.ai/v1/chat/completions", expect.any(Object));
      expect(mockedRecordPrediction).toHaveBeenCalledWith(
        expect.objectContaining({
          modelId: "grok-risk-summary",
          metric: "risk_summary",
          reasoning: summary,
        }),
      );
    });

    it("throws error with HTTP status when Grok response is not ok", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => "Too many requests",
      } as Response);

      await expect(
        grokRiskSummary({
          aum: 100,
          activeLoans: 10,
          avgDpd: 5,
          defaultRate: 0.02,
        }),
      ).rejects.toThrow("Grok API error 429: Too many requests");
    });
  });

  describe("grokDefaultRisk", () => {
    const payload = {
      customerId: "cust-1",
      avgDaysToPay: 30,
      yearsInBusiness: 5,
      industry: "Manufacturing",
      outstandingAmount: 150_000,
    };

    it("parses JSON response and returns probability with reasoning", async () => {
      const responseBody = { probability: 0.42, reasoning: "Moderate risk" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: JSON.stringify(responseBody) },
            },
          ],
        }),
      } as Response);

      const result = await grokDefaultRisk(payload);

      expect(result).toEqual(responseBody);
      expect(mockedRecordPrediction).toHaveBeenCalledWith(
        expect.objectContaining({
          modelId: "grok-default-risk",
          customerId: "cust-1",
          predictedValue: responseBody.probability,
        }),
      );
    });

    it("bubbles up Grok API errors", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(grokDefaultRisk(payload)).rejects.toThrow("Grok API error 500");
    });
  });
});
