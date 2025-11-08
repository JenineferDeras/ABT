"use client";

import type { ProductOpportunity } from "@/lib/data/financial-intelligence";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface ProductOpportunitiesProps {
  opportunities: ProductOpportunity[];
  isLoading: boolean;
}

const stageStyles: Record<ProductOpportunity["lifecycleStage"], string> = {
  incubate: "bg-amber-500/10 text-amber-200 border-amber-500/30",
  pilot: "bg-sky-500/10 text-sky-200 border-sky-500/30",
  scale: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
};

const fitCopy: Record<ProductOpportunity["strategicFit"], string> = {
  core: "Core",
  adjacent: "Adjacent",
  transformational: "Transformational",
};

function renderSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-purple-500/10 bg-slate-900/30 p-5"
        >
          <div className="h-3 w-40 animate-pulse rounded bg-purple-500/20" />
          <div className="mt-3 h-5 w-64 animate-pulse rounded bg-slate-600/30" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-700/30" />
        </div>
      ))}
    </div>
  );
}

export default function ProductOpportunities({
  opportunities,
  isLoading,
}: ProductOpportunitiesProps) {
  return (
    <section className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-purple-950/30 p-6 shadow-xl">
      <header className="mb-6">
        <h3 className="text-xl font-semibold text-white">
          Product Opportunity Pipeline
        </h3>
        <p className="text-sm text-purple-200/80">
          Quantified runway for strategic lending products with
          probability-weighted revenue and payback benchmarks.
        </p>
      </header>

      {isLoading ? (
        renderSkeleton()
      ) : opportunities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-purple-500/20 p-6 text-center text-sm text-purple-200/70">
          No new opportunities are currently tracked. Sync with product strategy
          to refresh the roadmap inputs.
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <article
              key={opportunity.id}
              className="rounded-xl border border-purple-400/20 bg-slate-900/40 p-5 transition hover:border-purple-400/40 hover:bg-slate-900/60"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-purple-300/80">
                    {opportunity.segment}
                  </p>
                  <h4 className="text-lg font-semibold text-white">
                    {opportunity.name}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-full border px-3 py-1 font-medium ${stageStyles[opportunity.lifecycleStage]}`}
                  >
                    {opportunity.lifecycleStage.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-purple-100">
                    {fitCopy[opportunity.strategicFit]} fit
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-300/80">
                {opportunity.summary}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-100">
                  <div className="text-xs uppercase tracking-wide text-emerald-300/80">
                    Expected Revenue
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {formatCurrency(opportunity.expectedAnnualRevenue, "USD", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    })}
                    /yr
                  </div>
                </div>
                <div className="rounded-lg border border-purple-500/20 bg-slate-950/40 p-3 text-purple-100">
                  <div className="text-xs uppercase tracking-wide text-purple-300/80">
                    Payback
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {opportunity.paybackPeriodMonths} months
                  </div>
                </div>
                <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-sky-100">
                  <div className="text-xs uppercase tracking-wide text-sky-300/80">
                    Adoption Probability
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {formatPercent(opportunity.adoptionProbability, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
