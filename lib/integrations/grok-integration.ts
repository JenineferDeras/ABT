import { ContinueLearning } from "@/lib/ml/continue-learning";
import type { Prediction } from "@/lib/ml/types";
import { Integration } from "./base-integration";

const grok = new Integration({
  name: "Grok",
  enabled: !!process.env.GROK_API_KEY,
  rateLimitPerMinute: 60,
  retryAttempts: 3,
  timeoutMs: 8000,
});

export async function grokRiskSummary(context: {
  aum: number;
  activeLoans: number;
  avgDpd: number;
  defaultRate: number;
}): Promise<string> {
  const prompt = `You are a senior risk officer. Summarize the portfolio health in 2-3 sentences.
AUM: $${context.aum.toLocaleString()}, Active loans: ${
    context.activeLoans
  }, Avg DPD: ${context.avgDpd} days, Default rate: ${(
    context.defaultRate * 100
  ).toFixed(2)}%.`;

  const payload = {
    model: "grok-beta",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  };

  const response = await grok.execute(async () => {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Grok error ${res.status}`);
    return res.json();
  });

  const summary =
    response.choices?.[0]?.message?.content?.trim() ?? "No summary";

  // Record prediction for Continue Learning
  const pred: Omit<Prediction, "id" | "createdAt" | "status"> = {
    modelId: "grok-risk-summary",
    customerId: "portfolio-level",
    metric: "risk_summary",
    predictedValue: 0,
    confidence: 0.9,
    reasoning: summary,
  };
  await ContinueLearning.recordPrediction(pred);

  return summary;
}
