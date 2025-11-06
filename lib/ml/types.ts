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
  errorType?: 'underestimate' | 'overestimate' | 'correct';
  userFeedback?: string;
  feedbackAt?: string;
  status?: 'awaiting_feedback' | 'feedback_received' | 'archived';
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
 * Prediction context for ML models
 */
export interface PredictionContext {
  aum: number;
  activeLoans: number;
  avgDpd: number;
  defaultRate: number;
}

/**
 * Feedback submission request
 */
export interface FeedbackSubmission {
  predictionId: string;
  actualOutcome: number;
  userFeedback?: string;
}
