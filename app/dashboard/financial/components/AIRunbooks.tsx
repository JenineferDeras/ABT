"use client";

import type { AIRunbook } from "@/lib/data/financial-intelligence";

interface AIRunbooksProps {
    runbooks: AIRunbook[];
    isLoading: boolean;
}

const automationCopy: Record<AIRunbook["automationLevel"], { label: string; tone: string; border: string }> = {
    assist: {
        label: "Assist",
        tone: "text-sky-200 bg-sky-500/10",
        border: "border-sky-500/30",
    },
    copilot: {
        label: "Copilot",
        tone: "text-violet-200 bg-violet-500/10",
        border: "border-violet-500/30",
    },
    autonomous: {
        label: "Autonomous",
        tone: "text-emerald-200 bg-emerald-500/10",
        border: "border-emerald-500/30",
    },
};

function renderSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-purple-500/10 bg-slate-900/30 p-5">
                    <div className="h-3 w-32 animate-pulse rounded bg-purple-500/20" />
                    <div className="mt-3 h-5 w-64 animate-pulse rounded bg-slate-600/30" />
                    <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-700/30" />
                </div>
            ))}
        </div>
    );
}

export default function AIRunbooks({ runbooks, isLoading }: AIRunbooksProps) {
    return (
        <section className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-indigo-950/40 p-6 shadow-xl">
            <header className="mb-6">
                <h3 className="text-xl font-semibold text-white">AI Operating Runbooks</h3>
                <p className="text-sm text-purple-200/80">
                    Machine-led execution lanes with ownership, automation tiering, and measurable outcomes for every AI role.
                </p>
            </header>

            {isLoading ? (
                renderSkeleton()
            ) : runbooks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-500/20 p-6 text-center text-sm text-purple-200/70">
                    No AI runbooks are currently defined. Align with operations to prioritize automation charters.
                </div>
            ) : (
                <div className="space-y-4">
                    {runbooks.map((runbook) => {
                        const automation = automationCopy[runbook.automationLevel];
                        return (
                            <article
                                key={runbook.id}
                                className={`rounded-xl border border-purple-400/20 bg-slate-900/40 p-5 transition hover:border-purple-400/40 hover:bg-slate-900/60`}
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-purple-300/80">{runbook.owner}</p>
                                        <h4 className="text-lg font-semibold text-white">{runbook.role}</h4>
                                        <p className="mt-2 text-sm text-slate-300/80">{runbook.objective}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${automation.tone} ${automation.border}`}>
                                            {automation.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                                    <div className="space-y-3">
                                        <h5 className="text-xs uppercase tracking-wide text-purple-300/70">Playbooks</h5>
                                        <ul className="space-y-2 text-sm text-purple-100">
                                            {runbook.playbooks.map((playbook) => (
                                                <li key={playbook} className="flex items-start gap-2">
                                                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-400" aria-hidden />
                                                    <span className="leading-relaxed">{playbook}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="rounded-xl border border-purple-500/20 bg-slate-950/50 p-4 text-sm text-purple-100">
                                        <h5 className="text-xs uppercase tracking-wide text-purple-300/70">Success Metrics</h5>
                                        <ul className="mt-3 space-y-2">
                                            {runbook.successMetrics.map((metric) => (
                                                <li key={metric.label} className="flex items-center justify-between gap-2">
                                                    <span className="text-purple-200/80">{metric.label}</span>
                                                    <span className="font-semibold text-white">{metric.target}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                                            <div className="uppercase tracking-wide text-emerald-300/80">Next Action</div>
                                            <p className="mt-1 leading-relaxed">{runbook.nextAction}</p>
                                        </div>
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
