"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Prediction } from "@/lib/ml/types";
import { useState } from "react";

interface PredictionFeedbackFormProps {
  prediction: Prediction;
  onSuccess?: () => void;
}

export function PredictionFeedbackForm({
  prediction,
  onSuccess,
}: PredictionFeedbackFormProps) {
  const [actualOutcome, setActualOutcome] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/ml/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          predictionId: prediction.id,
          actualOutcome: parseFloat(actualOutcome),
          userFeedback: feedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      const result = await response.json();
      setSuccess(true);
      setActualOutcome("");
      setFeedback("");

      if (onSuccess) {
        onSuccess();
      }

      console.log("Feedback submitted. Model accuracy:", result.accuracy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prediction">Original Prediction</Label>
            <Input
              id="prediction"
              value={prediction.predictedValue}
              disabled
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualOutcome">Actual Outcome</Label>
            <Input
              id="actualOutcome"
              type="number"
              step="0.01"
              value={actualOutcome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setActualOutcome(e.target.value)
              }
              required
              placeholder="Enter actual outcome value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFeedback(e.target.value)
              }
              placeholder="Share your observations about this prediction..."
              rows={4}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-500" role="alert">
              Feedback submitted successfully!
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
