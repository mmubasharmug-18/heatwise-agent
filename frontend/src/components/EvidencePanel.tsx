import type { EvidenceSignal } from "../types/api";

const ARROW = { up: "↑", down: "↓", neutral: "•" } as const;
const COLOR = {
  up: "text-thermal-critical",
  down: "text-thermal-low",
  neutral: "text-ink-muted",
} as const;

export default function EvidencePanel({ evidence }: { evidence: EvidenceSignal[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-xs font-mono tracking-widest text-ink-muted mb-4">
        WHY THIS DECISION?
      </h3>
      <ul className="space-y-3">
        {evidence.map((e) => (
          <li key={e.label} className="flex gap-3 text-sm">
            <span className={`font-mono ${COLOR[e.direction]} shrink-0`}>{ARROW[e.direction]}</span>
            <div>
              <span className="font-medium">{e.label}</span>
              <p className="text-ink-muted text-xs mt-0.5 leading-relaxed">{e.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
