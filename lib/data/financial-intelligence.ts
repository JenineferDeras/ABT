export type MetricUnit = "currency" | "percentage" | "count" | "ratio";

export interface MetricChange {
  direction: "up" | "down";
  percentage: number;
  absolute?: number;
  period: "MoM" | "QoQ" | "YoY";
}

export interface FinancialMetric {
  id: string;
  label: string;
  description: string;
  value: number;
  unit: MetricUnit;
  currency?: string;
  change: MetricChange;
  target?: number;
}

export interface GrowthPoint {
  month: string;
  netAssetValue: number;
  newAssets: number;
  retentionRate: number;
}

export interface SectorExposure {
  sector: string;
  allocation: number;
  changeBps: number;
}

export interface StressScenario {
  scenario: string;
  lossImpact: number;
  probability: number;
}

export interface EarlyWarning {
  id: string;
  label: string;
  severity: "low" | "moderate" | "high";
  detail: string;
}

export interface RiskOverview {
  summary: string;
  score: number;
  status: "low" | "moderate" | "high";
  valueAtRisk: {
    amount: number;
    horizon: string;
    confidence: number;
  };
  expectedShortfall: number;
  defaultRate: number;
  exposures: SectorExposure[];
  stressScenarios: StressScenario[];
  earlyWarnings: EarlyWarning[];
}

export interface ProviderStatus {
  name: string;
  status: "operational" | "degraded" | "offline";
  responseTimeMs: number;
  lastSync: string;
  coverage: string[];
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  recommendedAction: string;
  tags: string[];
}

export interface FinancialDashboardDataset {
  metrics: FinancialMetric[];
  growthSeries: GrowthPoint[];
  risk: RiskOverview;
  providers: ProviderStatus[];
  insights: Insight[];
  predictiveSignals: PredictiveSignal[];
  productOpportunities: ProductOpportunity[];
  aiRunbooks: AIRunbook[];
  generatedAt: string;
  refreshIntervalMinutes: number;
}

export interface PredictiveSignal {
  id: string;
  title: string;
  metric: string;
  unit: MetricUnit;
  currentValue: number;
  projectedValue: number;
  forecastHorizon: string;
  confidence: number;
  drivers: string[];
  recommendedAction: string;
}

export type ProductLifecycleStage = "incubate" | "pilot" | "scale";

export interface ProductOpportunity {
  id: string;
  name: string;
  segment: string;
  summary: string;
  expectedAnnualRevenue: number;
  paybackPeriodMonths: number;
  adoptionProbability: number;
  lifecycleStage: ProductLifecycleStage;
  strategicFit: "core" | "adjacent" | "transformational";
}

export type AutomationLevel = "assist" | "copilot" | "autonomous";

export interface AIRunbook {
  id: string;
  role: string;
  objective: string;
  automationLevel: AutomationLevel;
  playbooks: string[];
  owner: string;
  successMetrics: { label: string; target: string }[];
  nextAction: string;
}

const now = new Date();

function formatShortMonth(date: Date): string {
  return date.toLocaleString("en-US", { month: "short", year: "2-digit" });
}

function addMonths(date: Date, months: number): Date {
  const clone = new Date(date.getTime());
  clone.setMonth(clone.getMonth() + months);
  return clone;
}

function toIsoString(date: Date): string {
  return date.toISOString();
}

const growthSeries: GrowthPoint[] = Array.from({ length: 12 }).map(
  (_, index) => {
    const date = addMonths(now, index - 11);
    const nav = 18_000_000 + index * 650_000;
    const inflows = 380_000 + index * 15_000;
    const retention = Math.min(0.985, 0.9 + index * 0.003);

    return {
      month: formatShortMonth(date),
      netAssetValue: nav,
      newAssets: inflows,
      retentionRate: Number(retention.toFixed(3)),
    } satisfies GrowthPoint;
  },
);

const predictiveSignals: PredictiveSignal[] = [
  {
    id: "aum-forecast",
    title: "AUM trajectory",
    metric: "Assets Under Management",
    unit: "currency",
    currentValue: 25_400_000,
    projectedValue: 27_800_000,
    forecastHorizon: "90 days",
    confidence: 0.82,
    drivers: [
      "Acceleration in fintech onboarding",
      "Stable churn below 1.5%",
      "Increased capital limits",
    ],
    recommendedAction:
      "Prioritize structured onboarding for APAC venture debt funds to capture projected inflows early.",
  },
  {
    id: "default-ceiling",
    title: "Default rate ceiling",
    metric: "Portfolio Default Rate",
    unit: "percentage",
    currentValue: 3.2,
    projectedValue: 2.7,
    forecastHorizon: "2 quarters",
    confidence: 0.76,
    drivers: [
      "Collateral refresh cycle",
      "Migration of subprime borrowers",
      "Automated early warnings",
    ],
    recommendedAction:
      "Expand automated covenant testing to tier-two borrowers to lock in the projected improvement.",
  },
  {
    id: "apr-compression",
    title: "Yield compression risk",
    metric: "Weighted APR",
    unit: "percentage",
    currentValue: 18.5,
    projectedValue: 17.9,
    forecastHorizon: "120 days",
    confidence: 0.68,
    drivers: [
      "Competitive pricing pressure",
      "Shift to secured lines",
      "Macro easing cycle",
    ],
    recommendedAction:
      "Pre-negotiate dynamic pricing floors for top quartile facilities to mitigate downside compression.",
  },
];

const productOpportunities: ProductOpportunity[] = [
  {
    id: "dynamic-receivables",
    name: "Dynamic Receivables Repricing",
    segment: "Enterprise SaaS",
    summary:
      "Usage-based credit extensions tied to invoice velocity with automated spread adjustments.",
    expectedAnnualRevenue: 4_200_000,
    paybackPeriodMonths: 11,
    adoptionProbability: 0.64,
    lifecycleStage: "pilot",
    strategicFit: "core",
  },
  {
    id: "green-facilities",
    name: "Green CapEx Facilities",
    segment: "Climate infrastructure",
    summary:
      "Tax-advantaged lending combining carbon reporting APIs with automated collateral scoring.",
    expectedAnnualRevenue: 5_500_000,
    paybackPeriodMonths: 14,
    adoptionProbability: 0.58,
    lifecycleStage: "incubate",
    strategicFit: "adjacent",
  },
  {
    id: "embedded-credit",
    name: "Embedded Credit SDK",
    segment: "Fintech platforms",
    summary:
      "White-label lending primitives with real-time risk gating and pre-built compliance workflows.",
    expectedAnnualRevenue: 7_800_000,
    paybackPeriodMonths: 9,
    adoptionProbability: 0.71,
    lifecycleStage: "scale",
    strategicFit: "transformational",
  },
];

const aiRunbooks: AIRunbook[] = [
  {
    id: "ai-risk-copilot",
    role: "Risk Copilot",
    objective:
      "Continuously scan exposures and triage early warning signals before human review.",
    automationLevel: "copilot",
    playbooks: [
      "Automated sector heatmaps",
      "Counterparty anomaly detection",
      "Real-time stress testing",
    ],
    owner: "Risk Intelligence Squad",
    successMetrics: [
      { label: "False positive reduction", target: "< 12%" },
      { label: "Alert triage time", target: "< 5 min" },
    ],
    nextAction:
      "Deploy streaming anomaly scoring on the LATAM portfolio feeds.",
  },
  {
    id: "ai-portfolio-strategist",
    role: "Portfolio Strategist",
    objective:
      "Recommend allocation shifts and capital raises aligned with growth mandates.",
    automationLevel: "assist",
    playbooks: [
      "Capital raise modelling",
      "Horizon scenario synthesis",
      "Risk-adjusted NPV scoring",
    ],
    owner: "Capital Markets Guild",
    successMetrics: [
      { label: "Capital efficiency uplift", target: "+ 240 bps" },
      { label: "Win rate on proposals", target: "> 55%" },
    ],
    nextAction:
      "Blend macro easing assumptions into the FY25 capital plan draft.",
  },
  {
    id: "ai-origination-autopilot",
    role: "Origination Autopilot",
    objective:
      "Run end-to-end underwriting for low-complexity tickets with human override hooks.",
    automationLevel: "autonomous",
    playbooks: ["KYB enrichment", "Dynamic pricing", "Covenant drafting"],
    owner: "Growth Underwriting Pod",
    successMetrics: [
      { label: "Time to decision", target: "< 12 min" },
      { label: "Manual intervention", target: "< 8%" },
    ],
    nextAction:
      "Roll out the autopilot workflow to the UK marketplace partners.",
  },
];

export const financialDashboardDataset: FinancialDashboardDataset = {
  metrics: [
    {
      id: "aum",
      label: "Assets Under Management",
      description: "Total assets actively managed across lending programs.",
      value: 25_400_000,
      unit: "currency",
      currency: "USD",
      change: {
        direction: "up",
        percentage: 4.2,
        absolute: 1_020_000,
        period: "MoM",
      },
      target: 26_000_000,
    },
    {
      id: "activeClients",
      label: "Active Institutional Clients",
      description: "Institutions with funds deployed in the last 30 days.",
      value: 1_247,
      unit: "count",
      change: {
        direction: "up",
        percentage: 2.6,
        absolute: 32,
        period: "MoM",
      },
      target: 1_300,
    },
    {
      id: "defaultRate",
      label: "Portfolio Default Rate",
      description: "Trailing 90-day default rate across originations.",
      value: 3.2,
      unit: "percentage",
      change: {
        direction: "down",
        percentage: 0.4,
        absolute: 0.1,
        period: "QoQ",
      },
      target: 2.9,
    },
    {
      id: "apr",
      label: "Weighted APR",
      description: "Blended annualised yield across all active facilities.",
      value: 18.5,
      unit: "percentage",
      change: {
        direction: "up",
        percentage: 0.7,
        absolute: 0.3,
        period: "MoM",
      },
      target: 19.0,
    },
    {
      id: "turnaround",
      label: "Credit Decision Turnaround",
      description: "Median decisioning time across intake pipeline (minutes).",
      value: 42,
      unit: "count",
      change: {
        direction: "down",
        percentage: 6.1,
        absolute: 3,
        period: "MoM",
      },
      target: 36,
    },
  ],
  growthSeries,
  risk: {
    summary:
      "Portfolio risk remains comfortably within operating guardrails with improved collateral coverage and lower defaults in growth sectors.",
    score: 27,
    status: "low",
    valueAtRisk: {
      amount: 1_240_000,
      horizon: "10-day",
      confidence: 0.95,
    },
    expectedShortfall: 1_780_000,
    defaultRate: 0.032,
    exposures: [
      { sector: "SaaS Lending", allocation: 0.28, changeBps: -18 },
      { sector: "SMB Working Capital", allocation: 0.22, changeBps: 9 },
      { sector: "Healthcare", allocation: 0.19, changeBps: 4 },
      { sector: "Climate & ESG", allocation: 0.16, changeBps: -6 },
      { sector: "Fintech Partnerships", allocation: 0.15, changeBps: 2 },
    ],
    stressScenarios: [
      { scenario: "Recessionary Shock", lossImpact: 0.072, probability: 0.12 },
      { scenario: "Credit Tightening", lossImpact: 0.054, probability: 0.18 },
      { scenario: "FX Dislocation", lossImpact: 0.031, probability: 0.08 },
    ],
    earlyWarnings: [
      {
        id: "ew-1",
        label: "North America SMB",
        severity: "moderate",
        detail: "Delinquency creeping above 4.5% threshold in Q4 cohorts.",
      },
      {
        id: "ew-2",
        label: "FX Hedging Buffer",
        severity: "low",
        detail: "Coverage ratio at 1.08× versus 1.1× policy floor.",
      },
    ],
  },
  providers: [
    {
      name: "Supabase Analytics Lake",
      status: "operational",
      responseTimeMs: 183,
      lastSync: toIsoString(now),
      coverage: ["portfolio_metrics", "risk_events"],
    },
    {
      name: "Global Market Data Feed",
      status: "degraded",
      responseTimeMs: 412,
      lastSync: toIsoString(addMonths(now, -1 / 3)),
      coverage: ["fx_rates", "volatility_index"],
    },
    {
      name: "Credit Bureau Bridge",
      status: "operational",
      responseTimeMs: 205,
      lastSync: toIsoString(now),
      coverage: ["bureau_scores", "early_warnings"],
    },
  ],
  insights: [
    {
      id: "insight-aum",
      title: "Growth concentration in SaaS lending",
      summary:
        "SaaS facilities delivered 46% of net new assets this quarter while maintaining sub-3% defaults.",
      confidence: 0.92,
      impact: "high",
      recommendedAction:
        "Expand underwriting capacity for recurring revenue facilities and uplift marketing budget by 12%.",
      tags: ["growth", "saas", "portfolio"],
    },
    {
      id: "insight-risk",
      title: "Stress resilience improving",
      summary:
        "Updated collateral waterfall reduces expected losses by 180 bps under the recessionary scenario.",
      confidence: 0.84,
      impact: "medium",
      recommendedAction:
        "Publish revised stress test deck for risk committee and reduce reserve buffer guidance by 0.5%.",
      tags: ["risk", "stress-testing"],
    },
    {
      id: "insight-ops",
      title: "Decision turnaround opportunity",
      summary:
        "Workflow automation trimmed median decisioning time by 6% but queue backlog spikes on Mondays.",
      confidence: 0.78,
      impact: "medium",
      recommendedAction:
        "Introduce staggered underwriting shifts early in the week and extend task automation to KYC reviews.",
      tags: ["operations", "automation"],
    },
  ],
  predictiveSignals,
  productOpportunities,
  aiRunbooks,
  generatedAt: toIsoString(now),
  refreshIntervalMinutes: 5,
};

export const financialIntelligence = financialDashboardDataset;

export default financialDashboardDataset;
