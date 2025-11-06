import { ContinueLearning } from "@/lib/ml/continue-learning";
import type { Prediction } from "@/lib/ml/types";
import { createClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe("ContinueLearning", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReset();
  });

  it("records a prediction and returns the generated id", async () => {
    const single = jest.fn().mockResolvedValue({
      data: { id: "mock-id" },
      error: null,
    });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));

    const from = jest.fn().mockImplementation((table: string) => {
      expect(table).toBe("ml_predictions");
      return { insert };
    });

    mockCreateClient.mockResolvedValueOnce({ from } as unknown as Awaited<ReturnType<typeof createClient>>);

    const payload: Omit<Prediction, "id" | "createdAt" | "status"> = {
      modelId: "model-1",
      customerId: "cust-1",
      metric: "default_risk",
      predictedValue: 0.2,
      confidence: 0.85,
      reasoning: "Test prediction",
    };

    const id = await ContinueLearning.recordPrediction(payload);

    expect(id).toBe("mock-id");
    expect(insert).toHaveBeenCalledWith([
      {
        model_id: "model-1",
        customer_id: "cust-1",
        metric: "default_risk",
        predicted_value: 0.2,
        confidence: 0.85,
        reasoning: "Test prediction",
        status: "awaiting_feedback",
      },
    ]);
  });

  it("submits feedback, recalculates metrics, and flags correctness", async () => {
    const predictionRow = {
      id: "mock-id",
      model_id: "model-1",
      customer_id: "cust-1",
      metric: "default_risk",
      predicted_value: 0.2,
      confidence: 0.85,
      reasoning: "Test prediction",
      status: "awaiting_feedback",
    };

    const selectPredictionSingle = jest.fn().mockResolvedValue({
      data: predictionRow,
      error: null,
    });
    const selectPredictionEq = jest.fn(() => ({ single: selectPredictionSingle }));

    const selectWasCorrectFinal = jest.fn().mockResolvedValue({
      data: [{ was_correct: true }, { was_correct: false }],
      error: null,
    });
    const selectWasCorrectModel = jest.fn(() => ({ eq: selectWasCorrectFinal }));

    const select = jest.fn((columns: string) => {
      if (columns === "*") {
        return { eq: selectPredictionEq };
      }

      if (columns === "was_correct") {
        return { eq: selectWasCorrectModel };
      }

      throw new Error(`Unexpected select columns: ${columns}`);
    });

    const updateEq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn(() => ({ eq: updateEq }));

    const upsert = jest.fn().mockResolvedValue({ error: null });

    const from = jest.fn().mockImplementation((table: string) => {
      if (table === "ml_predictions") {
        return { select, update };
      }

      if (table === "ml_model_metrics") {
        return { upsert };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    mockCreateClient.mockResolvedValueOnce({ from } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await ContinueLearning.submitFeedback("mock-id", 0.21, "Looks good");

    expect(result).toEqual({ learned: true, accuracy: 50, wasCorrect: true });
    expect(updateEq).toHaveBeenCalledWith("id", "mock-id");
    expect(upsert).toHaveBeenCalledWith({
      model_id: "model-1",
      total_predictions: 2,
      correct_predictions: 1,
      accuracy: 50,
      last_updated: expect.any(String),
    });
  });

  it("returns default metrics when no record exists yet", async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "No rows" },
    });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));

    const from = jest.fn().mockImplementation((table: string) => {
      expect(table).toBe("ml_model_metrics");
      return { select };
    });

    mockCreateClient.mockResolvedValueOnce({ from } as unknown as Awaited<ReturnType<typeof createClient>>);

    const metrics = await ContinueLearning.getMetrics("model-1");

    expect(metrics.modelId).toBe("model-1");
    expect(metrics.totalPredictions).toBe(0);
    expect(metrics.correctPredictions).toBe(0);
    expect(metrics.accuracy).toBe(0);
    expect(typeof metrics.lastUpdated).toBe("string");
  });

  describe("getMetrics", () => {
    it("should return model metrics", async () => {
      const metrics = await ContinueLearning.getMetrics("test-model");

      expect(metrics).toHaveProperty("modelId");
      expect(metrics).toHaveProperty("totalPredictions");
      expect(metrics).toHaveProperty("correctPredictions");
      expect(metrics).toHaveProperty("accuracy");
      expect(metrics).toHaveProperty("lastUpdated");
    });
  });
});

