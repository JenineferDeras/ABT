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

  it("maps predictions by customer into camelCase", async () => {
    const order = jest.fn().mockResolvedValue({
      data: [
        {
          id: "pred-1",
          model_id: "model-1",
          customer_id: "cust-1",
          metric: "default_risk",
          predicted_value: 0.3,
          confidence: 0.9,
          reasoning: "Testing",
          created_at: "2025-01-01T00:00:00.000Z",
          actual_outcome: 0.32,
          was_correct: true,
          error_magnitude: 0.02,
          error_type: "correct",
          user_feedback: "Nice",
          feedback_at: "2025-01-02T00:00:00.000Z",
          status: "feedback_received",
        },
      ],
      error: null,
    });
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));

    const from = jest.fn().mockImplementation((table: string) => {
      expect(table).toBe("ml_predictions");
      return { select };
    });

    mockCreateClient.mockResolvedValueOnce({ from } as unknown as Awaited<ReturnType<typeof createClient>>);

    const predictions = await ContinueLearning.getPredictionsByCustomer("cust-1");

    expect(predictions).toHaveLength(1);
    expect(predictions[0]).toStrictEqual({
      id: "pred-1",
      modelId: "model-1",
      customerId: "cust-1",
      metric: "default_risk",
      predictedValue: 0.3,
      confidence: 0.9,
      reasoning: "Testing",
      createdAt: "2025-01-01T00:00:00.000Z",
      actualOutcome: 0.32,
      wasCorrect: true,
      errorMagnitude: 0.02,
      errorType: "correct",
      userFeedback: "Nice",
      feedbackAt: "2025-01-02T00:00:00.000Z",
      status: "feedback_received",
    });
  });
});

