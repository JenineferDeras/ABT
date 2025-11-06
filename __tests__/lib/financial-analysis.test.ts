import {
  calculateAverageDaysToPay,
  calculateDefaultRisk,
  calculatePaymentConsistency,
  getIndustryRiskScore,
  type ClientRiskProfile,
  type InvoiceData,
} from "@/lib/financial-analysis";

describe("Financial Analysis - Production Tests", () => {
  // Use realistic production data scenarios
  const productionInvoices: InvoiceData[] = [
    {
      invoice_amount: 125000,
      issue_date: new Date("2024-01-05"),
      due_date: new Date("2024-02-04"),
      payment_date: new Date("2024-02-08"),
      payment_status: "paid",
    },
    {
      invoice_amount: 87500,
      issue_date: new Date("2024-02-12"),
      due_date: new Date("2024-03-14"),
      payment_date: new Date("2024-03-16"),
      payment_status: "paid",
    },
    {
      invoice_amount: 210000,
      issue_date: new Date("2024-03-20"),
      due_date: new Date("2024-04-19"),
      payment_date: new Date("2024-04-22"),
      payment_status: "paid",
    },
  ];

  describe("calculateAverageDaysToPay", () => {
    it("calculates average correctly for production invoices", () => {
      const avg = calculateAverageDaysToPay(productionInvoices);
      expect(avg).toBeGreaterThan(0);
      expect(avg).toBeLessThan(40);
    });

    it("returns 0 for no paid invoices", () => {
      const result = calculateAverageDaysToPay([]);
      expect(result).toBe(0);
    });

    it("handles late payments correctly", () => {
      const latePaymentInvoices: InvoiceData[] = [
        {
          invoice_amount: 50000,
          issue_date: new Date("2024-01-01"),
          due_date: new Date("2024-01-31"),
          payment_date: new Date("2024-03-15"), // 45 days late
          payment_status: "paid",
        },
      ];
      const avg = calculateAverageDaysToPay(latePaymentInvoices);
      expect(avg).toBeGreaterThan(70);
    });
  });

  describe("calculateDefaultRisk", () => {
    it("calculates risk score within valid range for established business", () => {
      const profile: ClientRiskProfile = {
        avgDaysToPay: 25,
        yearsInBusiness: 5,
        industryRiskScore: 10,
        paymentConsistency: 80,
        outstandingAmount: 500000,
      };

      const risk = calculateDefaultRisk(profile);
      expect(risk).toBeGreaterThanOrEqual(0);
      expect(risk).toBeLessThanOrEqual(100);
      expect(risk).toBeGreaterThan(60); // Should be relatively low risk
    });

    it("penalizes high days to pay significantly", () => {
      const goodProfile: ClientRiskProfile = {
        avgDaysToPay: 10,
        yearsInBusiness: 5,
        industryRiskScore: 10,
        paymentConsistency: 80,
        outstandingAmount: 500000,
      };

      const badProfile: ClientRiskProfile = {
        ...goodProfile,
        avgDaysToPay: 70,
      };

      const goodRisk = calculateDefaultRisk(goodProfile);
      const badRisk = calculateDefaultRisk(badProfile);

      expect(badRisk).toBeLessThan(goodRisk);
      expect(goodRisk - badRisk).toBeGreaterThan(30); // Significant penalty
    });

    it("correctly assesses high-risk new business", () => {
      const highRiskProfile: ClientRiskProfile = {
        avgDaysToPay: 65,
        yearsInBusiness: 0.5,
        industryRiskScore: 18, // Construction
        paymentConsistency: 45,
        outstandingAmount: 1000000,
      };

      const risk = calculateDefaultRisk(highRiskProfile);
      expect(risk).toBeLessThan(40); // Should be high risk (low score)
    });
  });

  describe("getIndustryRiskScore", () => {
    it("returns correct scores for known industries", () => {
      expect(getIndustryRiskScore("construction")).toBe(18);
      expect(getIndustryRiskScore("technology")).toBe(5);
      expect(getIndustryRiskScore("finance")).toBe(6);
      expect(getIndustryRiskScore("healthcare")).toBe(8);
    });

    it("returns default score for unknown industry", () => {
      expect(getIndustryRiskScore("cryptocurrency")).toBe(10);
      expect(getIndustryRiskScore("unknown-industry")).toBe(10);
    });

    it("is case-insensitive", () => {
      expect(getIndustryRiskScore("CONSTRUCTION")).toBe(18);
      expect(getIndustryRiskScore("Technology")).toBe(5);
    });
  });

  describe("calculatePaymentConsistency", () => {
    it("returns high score for consistent payments", () => {
      const consistentInvoices: InvoiceData[] = productionInvoices.map(
        (inv, i) => ({
          ...inv,
          payment_date: new Date(
            inv.due_date.getTime() + (3 + i) * 24 * 60 * 60 * 1000
          ),
        })
      );

      const consistency = calculatePaymentConsistency(consistentInvoices);
      expect(consistency).toBeGreaterThan(70);
    });

    it("returns low score for inconsistent payments", () => {
      const inconsistentInvoices: InvoiceData[] = [
        {
          ...productionInvoices[0],
          payment_date: new Date(
            productionInvoices[0].due_date.getTime() + 2 * 24 * 60 * 60 * 1000
          ),
        },
        {
          ...productionInvoices[1],
          payment_date: new Date(
            productionInvoices[1].due_date.getTime() + 45 * 24 * 60 * 60 * 1000
          ),
        },
        {
          ...productionInvoices[2],
          payment_date: new Date(
            productionInvoices[2].due_date.getTime() + 5 * 24 * 60 * 60 * 1000
          ),
        },
      ];

      const consistency = calculatePaymentConsistency(inconsistentInvoices);
      expect(consistency).toBeLessThan(70);
    });
  });
});
