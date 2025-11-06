/**
 * Financial analysis utilities for risk assessment and portfolio metrics
 */

export interface InvoiceData {
  invoice_amount: number;
  issue_date: Date;
  due_date: Date;
  payment_date?: Date;
  payment_status: string;
}

export interface ClientRiskProfile {
  avgDaysToPay: number;
  yearsInBusiness: number;
  industryRiskScore: number;
  paymentConsistency: number;
  outstandingAmount: number;
}

/**
 * Calculate average days to pay from invoice history
 */
export function calculateAverageDaysToPay(invoices: InvoiceData[]): number {
  const paidInvoices = invoices.filter(
    (inv) => inv.payment_date && inv.payment_status === "paid"
  );

  if (paidInvoices.length === 0) return 0;

  const totalDays = paidInvoices.reduce((sum, inv) => {
    const days = Math.floor(
      (inv.payment_date!.getTime() - inv.issue_date.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  return totalDays / paidInvoices.length;
}

/**
 * Calculate payment consistency score (0-100)
 * Higher score = more consistent payment behavior
 */
export function calculatePaymentConsistency(invoices: InvoiceData[]): number {
  const paidInvoices = invoices.filter((inv) => inv.payment_date);

  if (paidInvoices.length < 3) return 50; // Not enough data

  const daysToPay = paidInvoices.map((inv) =>
    Math.floor(
      (inv.payment_date!.getTime() - inv.issue_date.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const mean = daysToPay.reduce((a, b) => a + b, 0) / daysToPay.length;
  const variance =
    daysToPay.reduce((sum, days) => sum + Math.pow(days - mean, 2), 0) /
    daysToPay.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = more consistent = higher score
  const consistencyScore = Math.max(0, 100 - stdDev * 2);

  return Math.min(100, consistencyScore);
}

/**
 * Calculate default risk score (0-100)
 * Higher score = lower risk (100 = safest)
 */
export function calculateDefaultRisk(profile: ClientRiskProfile): number {
  let riskScore = 100;

  // Payment behavior (0-40 points deduction)
  if (profile.avgDaysToPay > 60) {
    riskScore -= 40;
  } else if (profile.avgDaysToPay > 30) {
    riskScore -= 20;
  } else if (profile.avgDaysToPay > 15) {
    riskScore -= 10;
  }

  // Business maturity (0-30 points deduction)
  if (profile.yearsInBusiness < 1) {
    riskScore -= 30;
  } else if (profile.yearsInBusiness < 3) {
    riskScore -= 15;
  } else if (profile.yearsInBusiness < 5) {
    riskScore -= 5;
  }

  // Industry risk (0-20 points deduction)
  riskScore -= profile.industryRiskScore;

  // Payment consistency (0-10 points deduction)
  if (profile.paymentConsistency < 50) {
    riskScore -= 10;
  } else if (profile.paymentConsistency < 70) {
    riskScore -= 5;
  }

  return Math.max(0, Math.min(100, riskScore));
}

/**
 * Calculate portfolio-level metrics
 */
export function calculatePortfolioMetrics(invoices: InvoiceData[]): {
  totalAUM: number;
  activeLoans: number;
  avgDPD: number;
  defaultRate: number;
} {
  const activeInvoices = invoices.filter(
    (inv) => inv.payment_status !== "paid"
  );

  const totalAUM = activeInvoices.reduce(
    (sum, inv) => sum + inv.invoice_amount,
    0
  );

  const overdueDays = activeInvoices.map((inv) =>
    Math.max(
      0,
      Math.floor((Date.now() - inv.due_date.getTime()) / (1000 * 60 * 60 * 24))
    )
  );

  const avgDPD =
    overdueDays.length > 0
      ? overdueDays.reduce((a, b) => a + b, 0) / overdueDays.length
      : 0;

  const defaultedCount = invoices.filter(
    (inv) => inv.payment_status === "defaulted"
  ).length;
  const defaultRate =
    invoices.length > 0 ? defaultedCount / invoices.length : 0;

  return {
    totalAUM,
    activeLoans: activeInvoices.length,
    avgDPD,
    defaultRate,
  };
}

/**
 * Get industry risk score (0-20)
 * Higher score = higher risk
 */
export function getIndustryRiskScore(industry: string): number {
  const industryRisks: Record<string, number> = {
    construction: 18,
    hospitality: 15,
    retail: 12,
    transportation: 10,
    technology: 5,
    healthcare: 8,
    manufacturing: 10,
    agriculture: 14,
    finance: 6,
    default: 10,
  };

  return industryRisks[industry.toLowerCase()] ?? industryRisks.default;
}
