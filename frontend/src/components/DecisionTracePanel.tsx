import type { DecisionTraceStep, HeatIntelligenceInfo } from "../types/api";

export function DecisionTracePanel({ trace }: { trace: DecisionTraceStep[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-xs font-mono tracking-widest text-ink-muted mb-1">
        DECISION TRACE
      </h3>
      <p className="text-[11px] text-ink-faint mb-5">
        A structured audit trail of agent actions and evidence — not hidden reasoning.
      </p>
      <ol className="space-y-2.5">
        {trace.map((step) => (
          <li key={step.step} className="flex gap-3 text-sm">
            <span className="font-mono text-xs text-signal shrink-0 w-5 pt-0.5">{step.step}.</span>
            <span className="text-ink-muted leading-relaxed">{step.description}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HeatIntelligenceBadge({ info }: { info: HeatIntelligenceInfo }) {
  if (!info.requested) {
    return (
      <div className="rounded-xl border border-border bg-surface/50 p-5 text-sm text-ink-muted">
        <span className="font-medium text-ink">Deep investigation skipped.</span> {info.reason}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-thermal-low" />
        <span className="text-sm font-medium">Deep Investigation Complete</span>
      </div>
      <p className="text-xs text-ink-muted mb-3">{info.reason}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {info.categories.map((c) => (
          <span key={c} className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border-soft text-ink-muted">
            ✓ {c}
          </span>
        ))}
      </div>
      {info.pdf_available && info.pdf_relative_path && (
        <a
          href={`/api/reports/${info.pdf_relative_path}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-signal hover:underline"
        >
          View Full FortyGuard Report →
        </a>
      )}
    </div>
  );
}
