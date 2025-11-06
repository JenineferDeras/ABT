import { ContinueLearning } from "@/lib/ml/continue-learning";
import type { FeedbackRequest } from "@/lib/ml/types";
import { NextResponse } from "next/server";

/**
 * POST /api/ml/feedback
 * Submit feedback for a prediction and update model metrics
 */
export async function POST(request: Request) {
  try {
    const body: FeedbackRequest = await request.json();

    // Validate required fields
    if (!body.predictionId || typeof body.actualOutcome !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: predictionId and actualOutcome" },
        { status: 400 }
      );
    }

    const result = await ContinueLearning.submitFeedback(
      body.predictionId,
      body.actualOutcome,
      body.userFeedback
    );

    return NextResponse.json({
      learned: result.learned,
      accuracy: result.accuracy,
      wasCorrect: result.wasCorrect,
      message: "Feedback recorded and model updated successfully",
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      {
        error: "Failed to submit feedback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
