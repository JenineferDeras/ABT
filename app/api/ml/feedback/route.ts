import { NextResponse } from "next/server";
import { ContinueLearning } from "@/lib/ml/continue-learning";
import type { FeedbackSubmission } from "@/lib/ml/types";

/**
 * POST /api/ml/feedback
 * Submit feedback for a prediction and update model metrics
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FeedbackSubmission;

    const { predictionId, actualOutcome, userFeedback } = body;

    // Validate required fields
    if (!predictionId || typeof actualOutcome !== "number") {
      return NextResponse.json(
        { error: "predictionId and actualOutcome are required" },
        { status: 400 }
      );
    }

    const { accuracy } = await ContinueLearning.submitFeedback(
      predictionId,
      actualOutcome,
      userFeedback
    );

    return NextResponse.json({
      learned: true,
      accuracy: Number(accuracy.toFixed(2)),
      message: "Feedback submitted and model updated",
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
