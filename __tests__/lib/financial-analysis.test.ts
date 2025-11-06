import {
  calculateAverageDaysToPay,
  calculateDefaultRisk,
  getIndustryRiskScore,
  type ClientRiskProfile,
  type InvoiceData,
} from "@/lib/financial-analysis";

describe("Financial Analysis", () => {
  const mockInvoices: InvoiceData[] = [
    {
      invoice_amount: 1000,
      issue_date: new Date("2024-01-01"),
      due_date: new Date("2024-01-31"),
      payment_date: new Date("2024-02-05"),
      payment_status: "paid",
    },
    {
      invoice_amount: 2000,
      issue_date: new Date("2024-02-01"),
      due_date: new Date("2024-02-28"),
      payment_date: new Date("2024-03-03"),
      payment_status: "paid",
    },
  ];

  describe("calculateAverageDaysToPay", () => {
    it("calculates average correctly for paid invoices", () => {
      const avg = calculateAverageDaysToPay(mockInvoices);
      expect(avg).toBeGreaterThan(0);
      expect(avg).toBeLessThan(40);
    });

    it("returns 0 for no paid invoices", () => {
      const result = calculateAverageDaysToPay([]);
      expect(result).toBe(0);
    });
  });

  describe("calculateDefaultRisk", () => {
    it("calculates risk score within valid range", () => {
      const profile: ClientRiskProfile = {
        avgDaysToPay: 25,
        yearsInBusiness: 5,
        industryRiskScore: 10,
        paymentConsistency: 80,
        outstandingAmount: 50000,
      };

      const risk = calculateDefaultRisk(profile);
      expect(risk).toBeGreaterThanOrEqual(0);
      expect(risk).toBeLessThanOrEqual(100);
    });

    it("penalizes high days to pay", () => {
      const goodProfile: ClientRiskProfile = {
        avgDaysToPay: 10,
        yearsInBusiness: 5,
        industryRiskScore: 10,
        paymentConsistency: 80,
        outstandingAmount: 50000,
      };

      const badProfile: ClientRiskProfile = {
        ...goodProfile,
        avgDaysToPay: 70,
      };

      expect(calculateDefaultRisk(badProfile)).toBeLessThan(
        calculateDefaultRisk(goodProfile)
      );
    });
  });

  describe("getIndustryRiskScore", () => {
    it("returns correct scores for known industries", () => {
      expect(getIndustryRiskScore("construction")).toBe(18);
      expect(getIndustryRiskScore("technology")).toBe(5);
      expect(getIndustryRiskScore("finance")).toBe(6);
    });

    it("returns default score for unknown industry", () => {
      expect(getIndustryRiskScore("unknown-industry")).toBe(10);
    });
  });
});
