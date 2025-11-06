"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface RiskScoreCardProps {
  clientName: string;
  riskScore: number;
  trend: "up" | "down" | "stable";
}

export function RiskScoreCard({
  clientName,
  riskScore,
  trend,
}: RiskScoreCardProps) {
  const getRiskColor = (score: number): string => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "down":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 80) return "Low Risk";
    if (score >= 60) return "Medium Risk";
    return "High Risk";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{clientName}</CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold ${getRiskColor(riskScore)}`}>
          {riskScore.toFixed(1)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {getRiskLevel(riskScore)}
        </p>
      </CardContent>
    </Card>
  );
}
