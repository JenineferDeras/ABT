"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Prediction } from "@/lib/ml/types";
import { useState } from "react";

interface PredictionFeedbackFormProps {
  prediction: Prediction;
  onSubmit: (actualOutcome: number, feedback: string) => Promise<void>;
}

export function PredictionFeedbackForm({
  prediction,
  onSubmit,
}: PredictionFeedbackFormProps) {
  const [actualOutcome, setActualOutcome] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(parseFloat(actualOutcome), feedback);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-green-600 font-medium">
            Thank you! Your feedback has been recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provide Feedback</CardTitle>
        <CardDescription>
          Help improve our model by providing the actual outcome
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="predicted">Predicted Value</Label>
            <Input
              id="predicted"
              value={prediction.predictedValue.toFixed(4)}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="actual">Actual Outcome</Label>
            <Input
              id="actual"
              type="number"
              step="0.0001"
              value={actualOutcome}
              onChange={(e) => setActualOutcome(e.target.value)}
              required
              placeholder="Enter the actual value"
            />
          </div>

          <div>
            <Label htmlFor="feedback">Additional Comments (Optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any additional context or observations..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
