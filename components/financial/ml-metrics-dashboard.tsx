"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ModelMetrics } from "@/lib/ml/types";

interface MLMetricsDashboardProps {
  readonly metrics: ModelMetrics[];
  readonly onUpdate?: (data: ModelMetrics[]) => void;
  readonly isLoading?: boolean;
}

export function MLMetricsDashboard({
  metrics,
  onUpdate,
  isLoading = false,
}: Readonly<MLMetricsDashboardProps>) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((model) => (
        <Card key={model.modelId}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {formatModelName(model.modelId)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-bold">{model.accuracy.toFixed(1)}%</span>
              </div>
              <Progress value={model.accuracy} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{model.totalPredictions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Correct</p>
                <p className="text-2xl font-bold text-green-600">
                  {model.correctPredictions}
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(model.lastUpdated).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatModelName(modelId: string): string {
  return modelId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
