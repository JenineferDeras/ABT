import { ContinueLearning } from "@/lib/ml/continue-learning";
import type { Prediction } from "@/lib/ml/types";
import { Integration } from "./base-integration";

/**
 * Grok API integration configuration
 */
const grokIntegration = new Integration({
  name: "Grok",
  enabled: !!process.env.GROK_API_KEY,
  rateLimitPerMinute: 60,
  retryAttempts: 3,
  timeoutMs: 8000,
});

interface GrokResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/**
 * Portfolio risk context for Grok analysis
 */
export interface RiskContext {
  aum: number;
  activeLoans: number;
  avgDpd: number;
  defaultRate: number;
}

/**
 * Generate a risk summary using Grok AI
 * @param context - Portfolio risk metrics
 * @returns Promise with AI-generated risk summary
 */
export async function grokRiskSummary(context: RiskContext): Promise<string> {
  const prompt = `You are a senior risk officer for a digital factoring fintech platform. Analyze the following portfolio metrics and provide a concise risk assessment in 2-3 sentences.

Portfolio Metrics:
- Assets Under Management (AUM): $${context.aum.toLocaleString()}
- Active Loans: ${context.activeLoans}
- Average Days Past Due (DPD): ${context.avgDpd} days
- Default Rate: ${(context.defaultRate * 100).toFixed(2)}%

Provide a professional risk summary focusing on key trends and recommendations.`;

  const payload = {
    model: "grok-beta",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2, // Lower temperature for more consistent output
    max_tokens: 200,
  };

  try {
    const response = await grokIntegration.execute<GrokResponse>(async () => {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Grok API error ${res.status}: ${errorText}`);
      }

      return res.json();
    });

    const summary =
      response.choices?.[0]?.message?.content?.trim() ||
      "Unable to generate risk summary";

    // Record prediction for Continue Learning
    const prediction: Omit<Prediction, "id" | "createdAt" | "status"> = {
      modelId: "grok-risk-summary",
      customerId: "portfolio-level", // Portfolio-wide analysis
      metric: "risk_summary",
      predictedValue: context.defaultRate, // Use default rate as predicted value
      confidence: 0.9,
      reasoning: summary,
    };

    await ContinueLearning.recordPrediction(prediction);

    return summary;
  } catch (error) {
    console.error("Grok risk summary error:", error);
    throw error;
  }
}

/**
 * Predict default risk for a specific customer using Grok
 * @param customerData - Customer financial data
 * @returns Promise with predicted default probability
 */
export async function grokDefaultRisk(customerData: {
  customerId: string;
  avgDaysToPay: number;
  yearsInBusiness: number;
  industry: string;
  outstandingAmount: number;
}): Promise<{ probability: number; reasoning: string }> {
  const prompt = `You are a credit risk analyst. Assess the default risk for a business with the following characteristics:

- Average Days to Pay: ${customerData.avgDaysToPay} days
- Years in Business: ${customerData.yearsInBusiness}
- Industry: ${customerData.industry}
- Outstanding Amount: $${customerData.outstandingAmount.toLocaleString()}

Provide:
1. A default probability (0.0 to 1.0)
2. A brief reasoning (1-2 sentences)

Format your response as JSON: {"probability": 0.XX, "reasoning": "..."}`;

  const payload = {
    model: "grok-beta",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 150,
  };

  try {
    const response = await grokIntegration.execute<GrokResponse>(async () => {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Grok API error ${res.status}`);
      }

      return res.json();
    });

    const content = response.choices?.[0]?.message?.content?.trim() || "{}";
    const result = JSON.parse(content);

    // Record prediction
    const prediction: Omit<Prediction, "id" | "createdAt" | "status"> = {
      modelId: "grok-default-risk",
      customerId: customerData.customerId,
      metric: "default_probability",
      predictedValue: result.probability,
      confidence: 0.85,
      reasoning: result.reasoning,
    };

    await ContinueLearning.recordPrediction(prediction);

    return result;
  } catch (error) {
    console.error("Grok default risk error:", error);
    throw error;
  }
}
