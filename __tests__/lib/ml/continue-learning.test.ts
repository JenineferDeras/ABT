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

  it("submits feedback, updates the row, and recalculates accuracy", async () => {
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
    const selectPredictionEq = jest.fn((_column: string, value: unknown) => {
      expect(value).toBe("mock-id");
      return { single: selectPredictionSingle };
    });

    const selectWasCorrectFinal = jest.fn().mockResolvedValue({
      data: [{ was_correct: true }, { was_correct: false }],
      error: null,
    });
    const selectWasCorrectStatus = jest.fn((_column: string, value: unknown) => {
      expect(value).toBe("feedback_received");
      return selectWasCorrectFinal();
    });
    const selectWasCorrectModel = jest.fn((_column: string, value: unknown) => {
      expect(value).toBe("model-1");
      return { eq: selectWasCorrectStatus };
    });

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

    expect(result).toEqual({ accuracy: 50 });
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
    const eq = jest.fn((_column: string, value: unknown) => {
      expect(value).toBe("model-1");
      return { single };
    });
    const select = jest.fn(() => ({ eq }));

    const from = jest.fn().mockImplementation((table: string) => {
      expect(table).toBe("ml_model_metrics");
      return { select };
    });

    mockCreateClient.mockResolvedValueOnce({ from } as unknown as Awaited<ReturnType<typeof createClient>>);

    const metrics = await ContinueLearning.getMetrics("model-1");

    expect(metrics).toEqual({
      modelId: "model-1",
      totalPredictions: 0,
      correctPredictions: 0,
      accuracy: 0,
      lastUpdated: expect.any(String),
    });
  });

  it("maps metric rows into the domain model when found", async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        model_id: "model-1",
        total_predictions: 10,
        correct_predictions: 7,
        accuracy: 70,
        last_updated: "2025-11-06T00:00:00.000Z",
      },
      error: null,
    });
    const eq = jest.fn((_column: string, value: unknown) => {
      expect(value).toBe("model-1");
      return { single };
    });
    const select = jest.fn(() => ({ eq }));

    const from = jest.fn().mockImplementation((table: string) => {
      expect(table).toBe("ml_model_metrics");
      return { select };
    });

    mockCreateClient.mockResolvedValueOnce({ from } as unknown as Awaited<ReturnType<typeof createClient>>);

    const metrics = await ContinueLearning.getMetrics("model-1");

    expect(metrics).toEqual({
      modelId: "model-1",
      totalPredictions: 10,
      correctPredictions: 7,
      accuracy: 70,
      lastUpdated: "2025-11-06T00:00:00.000Z",
    });
  });
});
