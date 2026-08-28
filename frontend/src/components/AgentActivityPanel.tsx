import { useEffect, useState } from "react";

const STEPS = [
  "Agent initialized",
  "Retrieving hyperlocal temperature intelligence",
  "Evaluating heat exposure",
  "Analyzing solar conditions",
  "Comparing environmental context",
  "Investigating high-risk locations",
  "Generating autonomous action plan",
];

export default function AgentActivityPanel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= STEPS.length - 1) return;
    const t = setTimeout(() => setActiveIndex((i) => i + 1), 750);
    return () => clearTimeout(t);
  }, [activeIndex]);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-thermal-high animate-pulse" />
        <span className="text-xs font-mono tracking-widest text-ink-muted">
          HEATWISE AGENT ACTIVE
        </span>
      </div>
      <ul className="space-y-3">
        {STEPS.map((step, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={`shrink-0 w-4 h-4 flex items-center justify-center font-mono text-[10px] ${
                  done
                    ? "text-thermal-low"
                    : current
                    ? "text-signal"
                    : "text-ink-faint"
                }`}
              >
                {done ? "✓" : current ? "•" : "○"}
              </span>
              <span className={done || current ? "text-ink" : "text-ink-faint"}>
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
