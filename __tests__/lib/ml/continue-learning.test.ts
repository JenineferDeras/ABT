import { ContinueLearning } from "@/lib/ml/continue-learning";
import type { Prediction } from "@/lib/ml/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = vi.hoisted(() => vi.fn());

describe("ContinueLearning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records a prediction and returns the generated id", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "mock-id" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));

    const from = vi.fn().mockImplementation((table: string) => {
      expect(table).toBe("ml_predictions");
      return { insert };
    });

    vi.mocked(mockCreateClient).mockResolvedValueOnce({
      from,
    } as unknown as Awaited<ReturnType<typeof mockCreateClient>>);

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

    const selectPredictionSingle = vi.fn().mockResolvedValue({
      data: predictionRow,
      error: null,
    });
    const selectPredictionEq = vi.fn((_column: string, value: unknown) => {
      expect(value).toBe("mock-id");
      return { single: selectPredictionSingle };
    });

    const selectWasCorrectFinal = vi.fn().mockResolvedValue({
      data: [{ was_correct: true }, { was_correct: false }],
      error: null,
    });
    const selectWasCorrectStatus = vi.fn((_column: string, value: unknown) => {
      expect(value).toBe("feedback_received");
      return selectWasCorrectFinal();
    });
    const selectWasCorrectModel = vi.fn((_column: string, value: unknown) => {
      expect(value).toBe("model-1");
      return { eq: selectWasCorrectStatus };
    });

    const select = vi.fn((columns: string) => {
      if (columns === "*") {
        return { eq: selectPredictionEq };
      }

      if (columns === "was_correct") {
        return { eq: selectWasCorrectModel };
      }

      throw new Error(`Unexpected select columns: ${columns}`);
    });

    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: updateEq }));

    const upsert = vi.fn().mockResolvedValue({ error: null });

    const from = vi.fn().mockImplementation((table: string) => {
      if (table === "ml_predictions") {
        return { select, update };
      }

      if (table === "ml_model_metrics") {
        return { upsert };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    vi.mocked(mockCreateClient).mockResolvedValueOnce({
      from,
    } as unknown as Awaited<ReturnType<typeof mockCreateClient>>);

    const result = await ContinueLearning.submitFeedback(
      "mock-id",
      0.21,
      "Looks good"
    );

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
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "No rows" },
    });
    const eq = vi.fn((_column: string, value: unknown) => {
      expect(value).toBe("model-1");
      return { single };
    });
    const select = vi.fn(() => ({ eq }));

    const from = vi.fn().mockImplementation((table: string) => {
      expect(table).toBe("ml_model_metrics");
      return { select };
    });

    vi.mocked(mockCreateClient).mockResolvedValueOnce({
      from,
    } as unknown as Awaited<ReturnType<typeof mockCreateClient>>);

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
    const single = vi.fn().mockResolvedValue({
      data: {
        model_id: "model-1",
        total_predictions: 10,
        correct_predictions: 7,
        accuracy: 70,
        last_updated: "2025-11-06T00:00:00.000Z",
      },
      error: null,
    });
    const eq = vi.fn((_column: string, value: unknown) => {
      expect(value).toBe("model-1");
      return { single };
    });
    const select = vi.fn(() => ({ eq }));

    const from = vi.fn().mockImplementation((table: string) => {
      expect(table).toBe("ml_model_metrics");
      return { select };
    });

    vi.mocked(mockCreateClient).mockResolvedValueOnce({
      from,
    } as unknown as Awaited<ReturnType<typeof mockCreateClient>>);

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
