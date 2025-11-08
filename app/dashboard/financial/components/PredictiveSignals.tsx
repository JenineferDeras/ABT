"use client";

import type { PredictiveSignal } from "@/lib/data/financial-intelligence";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface PredictiveSignalsProps {
  signals: PredictiveSignal[];
  isLoading: boolean;
}

function formatValue(value: number, unit: PredictiveSignal["unit"]): string {
  if (unit === "currency") {
    return formatCurrency(value, "USD", {
      notation: "standard",
      maximumFractionDigits: value >= 1_000_000 ? 0 : 1,
    });
  }

  if (unit === "percentage") {
    return `${formatNumber(value, { maximumFractionDigits: 1 })}%`;
  }

  return formatNumber(value, {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
}

function renderSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-purple-500/10 bg-slate-900/30 p-5"
        >
          <div className="h-3 w-48 animate-pulse rounded bg-purple-500/20" />
          <div className="mt-3 flex items-center gap-4">
            <div className="h-10 w-32 animate-pulse rounded bg-slate-600/40" />
            <div className="h-8 w-24 animate-pulse rounded bg-slate-700/40" />
          </div>
          <div className="mt-4 h-2 w-full animate-pulse rounded bg-purple-500/10" />
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 2 }).map((_, chipIndex) => (
              <div
                key={chipIndex}
                className="h-5 w-28 animate-pulse rounded-full bg-slate-700/30"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PredictiveSignals({
  signals,
  isLoading,
}: PredictiveSignalsProps) {
  return (
    <section className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-950/40 p-6 shadow-xl">
      <header className="mb-6">
        <h3 className="text-xl font-semibold text-white">Predictive Signals</h3>
        <p className="text-sm text-purple-200/80">
          Forward-looking intelligence combining machine learning forecasts with
          observed portfolio performance.
        </p>
      </header>

      {isLoading ? (
        renderSkeleton()
      ) : signals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-purple-500/20 p-6 text-center text-sm text-purple-200/70">
          Forecast models are still training. Check back after the next
          ingestion cycle completes.
        </div>
      ) : (
        <div className="space-y-5">
          {signals.map((signal) => {
            const delta = signal.projectedValue - signal.currentValue;
            const deltaDisplay = `${delta >= 0 ? "+" : ""}${formatValue(delta, signal.unit)}`;
            return (
              <article
                key={signal.id}
                className="rounded-xl border border-purple-400/20 bg-slate-900/40 p-5 transition hover:border-purple-400/40 hover:bg-slate-900/60"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-purple-300/80">
                      {signal.metric}
                    </p>
                    <h4 className="text-lg font-semibold text-white">
                      {signal.title}
                    </h4>
                  </div>
                  <div className="text-right text-sm text-purple-200/70">
                    <div>
                      Confidence{" "}
                      {formatPercent(signal.confidence, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="mt-1 text-xs text-purple-200/50">
                      Horizon {signal.forecastHorizon}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
                  <div>
                    <div className="text-xs text-purple-200/70">Current</div>
                    <div className="text-2xl font-semibold text-white">
                      {formatValue(signal.currentValue, signal.unit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-200/70">Projected</div>
                    <div className="text-2xl font-semibold text-white">
                      {formatValue(signal.projectedValue, signal.unit)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-purple-500/20 bg-slate-950/40 p-3 text-sm text-purple-100">
                    <div className="font-medium">Delta {deltaDisplay}</div>
                    <div className="text-xs text-purple-200/60">
                      {delta >= 0 ? "Upside" : "Downside"} scenario
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400"
                      style={{
                        width: `${Math.min(100, Math.max(6, signal.confidence * 100))}%`,
                      }}
                      role="progressbar"
                      aria-valuenow={Math.round(signal.confidence * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Forecast confidence"
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
                  <ul className="flex flex-wrap gap-2">
                    {signal.drivers.map((driver, index) => (
                      <li
                        key={driver}
                        className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-100"
                        aria-label={`Driver ${index + 1}: ${driver}`}
                      >
                        <span className="text-purple-300/80" aria-hidden="true">
                          Driver {index + 1}:
                        </span>{" "}
                        {driver}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                    <div className="text-xs uppercase tracking-wide text-emerald-300/80">
                      Action
                    </div>
                    <p className="mt-1 leading-relaxed">
                      {signal.recommendedAction}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
