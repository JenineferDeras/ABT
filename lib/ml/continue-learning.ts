import { createClient } from "@/lib/supabase/server";
import type { FeedbackResponse, ModelMetrics, Prediction } from "./types";

/**
 * Continue Learning Framework
 * Implements ML feedback loop for continuous model improvement
 */
export class ContinueLearning {
  /**
   * Record a new prediction for tracking
   * @param pred - Prediction data (without id, createdAt, status)
   * @returns Promise with the created prediction ID
   */
  static async recordPrediction(
    pred: Omit<Prediction, "id" | "createdAt" | "status">
  ): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ml_predictions")
      .insert([
        {
          model_id: pred.modelId,
          customer_id: pred.customerId,
          metric: pred.metric,
          predicted_value: pred.predictedValue,
          confidence: pred.confidence,
          reasoning: pred.reasoning,
          status: "awaiting_feedback",
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Error recording prediction:", error);
      throw new Error(`Failed to record prediction: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Submit feedback for a prediction and recalculate model metrics
   * @param predictionId - UUID of the prediction
   * @param actual - Actual outcome value
   * @param userFeedback - Optional user comment
   * @returns Promise with updated accuracy and correctness
   */
  static async submitFeedback(
    predictionId: string,
    actual: number,
    userFeedback?: string
  ): Promise<FeedbackResponse> {
    const supabase = await createClient();

    // Fetch the prediction
    const { data: pred, error: fetchErr } = await supabase
      .from("ml_predictions")
      .select("*")
      .eq("id", predictionId)
      .single();

    if (fetchErr) {
      console.error("Error fetching prediction:", fetchErr);
      throw new Error(`Failed to fetch prediction: ${fetchErr.message}`);
    }

    // Calculate error metrics
    const errorMag = Math.abs(actual - pred.predicted_value);
    const tolerance = Math.abs(pred.predicted_value) * 0.1;
    const wasCorrect = errorMag <= tolerance;
    const errorType = wasCorrect
      ? "correct"
      : actual > pred.predicted_value
      ? "underestimate"
      : "overestimate";

    // Update prediction with feedback
    const { error: updateErr } = await supabase
      .from("ml_predictions")
      .update({
        actual_outcome: actual,
        was_correct: wasCorrect,
        error_magnitude: errorMag,
        error_type: errorType,
        user_feedback: userFeedback,
        feedback_at: new Date().toISOString(),
        status: "feedback_received",
      })
      .eq("id", predictionId);

    if (updateErr) {
      console.error("Error updating prediction:", updateErr);
      throw new Error(`Failed to update prediction: ${updateErr.message}`);
    }

    // Recalculate model metrics
    const { data: allPredictions, error: metricErr } = await supabase
      .from("ml_predictions")
      .select("was_correct")
      .eq("model_id", pred.model_id)
      .eq("status", "feedback_received");

    if (metricErr) {
      console.error("Error fetching metrics:", metricErr);
      throw new Error(`Failed to fetch metrics: ${metricErr.message}`);
    }

    const correct = allPredictions.filter((r) => r.was_correct).length;
    const total = allPredictions.length;
    const accuracy = total ? (correct / total) * 100 : 0;

    // Upsert model metrics
    const { error: upsertErr } = await supabase
      .from("ml_model_metrics")
      .upsert({
        model_id: pred.model_id,
        total_predictions: total,
        correct_predictions: correct,
        accuracy,
        last_updated: new Date().toISOString(),
      });

    if (upsertErr) {
      console.error("Error upserting metrics:", upsertErr);
      throw new Error(`Failed to update metrics: ${upsertErr.message}`);
    }

    return {
      learned: true,
      accuracy: Number(accuracy.toFixed(2)),
      wasCorrect,
    };
  }

  /**
   * Get current metrics for a model
   * @param modelId - Model identifier
   * @returns Promise with model metrics
   */
  static async getMetrics(modelId: string): Promise<ModelMetrics> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ml_model_metrics")
      .select("*")
      .eq("model_id", modelId)
      .single();

    // If no row exists yet, return default metrics
    if (error && error.code === "PGRST116") {
      return {
        modelId,
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    if (error) {
      console.error("Error fetching metrics:", error);
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }

    return {
      modelId: data.model_id,
      totalPredictions: data.total_predictions ?? 0,
      correctPredictions: data.correct_predictions ?? 0,
      accuracy:
        typeof data.accuracy === "number"
          ? data.accuracy
          : Number(data.accuracy ?? 0),
      lastUpdated: data.last_updated ?? new Date().toISOString(),
    };
  }

  /**
   * Get all predictions for a customer
   * @param customerId - Customer UUID
   * @returns Promise with array of predictions
   */
  static async getPredictionsByCustomer(
    customerId: string
  ): Promise<Prediction[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ml_predictions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching predictions:", error);
      throw new Error(`Failed to fetch predictions: ${error.message}`);
    }

    return data.map((p) => ({
      id: p.id,
      modelId: p.model_id,
      customerId: p.customer_id,
      metric: p.metric,
      predictedValue: p.predicted_value,
      confidence: p.confidence,
      reasoning: p.reasoning,
      createdAt: p.created_at,
      actualOutcome: p.actual_outcome,
      wasCorrect: p.was_correct,
      errorMagnitude: p.error_magnitude,
      errorType: p.error_type,
      userFeedback: p.user_feedback,
      feedbackAt: p.feedback_at,
      status: (p.status ??
        "awaiting_feedback") as Prediction["status"] | undefined,
    }));
  }
}
