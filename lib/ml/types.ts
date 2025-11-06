/**
 * ML prediction record structure
 */
export interface Prediction {
  id?: string;
  modelId: string;
  customerId: string;
  metric: string;
  predictedValue: number;
  confidence: number;
  reasoning?: string;
  createdAt?: string;
  actualOutcome?: number;
  wasCorrect?: boolean;
  errorMagnitude?: number;
  errorType?: "underestimate" | "overestimate" | "correct";
  userFeedback?: string;
  feedbackAt?: string;
  status?: string;
}

/**
 * Aggregated model performance metrics
 */
export interface ModelMetrics {
  modelId: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  lastUpdated: string;
}

/**
 * Feedback submission request
 */
export interface FeedbackRequest {
  predictionId: string;
  actualOutcome: number;
  userFeedback?: string;
}

/**
 * Feedback submission response
 */
export interface FeedbackResponse {
  learned: boolean;
  accuracy: number;
  wasCorrect: boolean;
}
