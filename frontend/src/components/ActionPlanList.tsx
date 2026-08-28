import { useState } from "react";
import type { ActionPlanItem } from "../types/api";

const PRIORITY_COLOR: Record<ActionPlanItem["priority"], string> = {
  LOW: "#3DDC97",
  MEDIUM: "#F5C244",
  HIGH: "#FF8A3D",
  CRITICAL: "#FF4757",
};

export default function ActionPlanList({ items }: { items: ActionPlanItem[] }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-xs font-mono tracking-widest text-ink-muted mb-5">
        AUTONOMOUS ACTION PLAN
      </h3>
      <ol className="space-y-3">
        {items.map((item, i) => {
          const open = expanded === i;
          return (
            <li key={i} className="rounded-lg border border-border-soft overflow-hidden">
              <button
                onClick={() => setExpanded(open ? null : i)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-raised transition-colors"
              >
                <span
                  className="text-[10px] font-mono font-semibold tracking-wide px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: `${PRIORITY_COLOR[item.priority]}22`, color: PRIORITY_COLOR[item.priority] }}
                >
                  {item.priority}
                </span>
                <span className="text-sm font-medium">{item.action}</span>
              </button>
              {open && (
                <div className="px-4 pb-4 pt-1 text-xs text-ink-muted space-y-2">
                  <p className="leading-relaxed">
                    <span className="text-ink-faint">Reason: </span>
                    {item.reason}
                  </p>
                  {item.supporting_data.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-ink-faint">
                      {item.supporting_data.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
