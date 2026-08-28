import type { WorkWindow } from "../types/api";

const LABEL_COLOR: Record<WorkWindow["label"], string> = {
  BEST: "#3DDC97",
  CAUTION: "#F5C244",
  AVOID: "#FF4757",
  RECOVERY: "#3DA9FC",
};

export default function WorkWindowTimeline({ windows }: { windows: WorkWindow[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-xs font-mono tracking-widest text-ink-muted mb-5">
        RECOMMENDED WORK WINDOWS
      </h3>
      <div className="space-y-4">
        {windows.map((w) => (
          <div key={w.label} className="flex items-start gap-4">
            <span className="font-mono text-xs text-ink-muted w-12 shrink-0 pt-0.5">{w.start}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-mono font-semibold tracking-wide px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${LABEL_COLOR[w.label]}22`, color: LABEL_COLOR[w.label] }}
                >
                  {w.label}
                </span>
                <span className="text-xs text-ink-faint font-mono">{w.start}–{w.end}</span>
              </div>
              <div
                className="h-1.5 rounded-full"
                style={{ backgroundColor: LABEL_COLOR[w.label], opacity: 0.85 }}
              />
              <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">{w.note}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[11px] text-ink-faint">
        Operational heat-risk recommendations — not a medical or occupational-safety directive.
      </p>
    </div>
  );
}
