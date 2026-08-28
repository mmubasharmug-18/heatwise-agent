import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { HistoryEntry } from "../types/api";
import { levelColor } from "../components/ThermalScale";

function levelFromScore(score: number): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MODERATE";
  return "LOW";
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getHistory()
      .then(setEntries)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load history."));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">History</h1>
      <p className="text-ink-muted mb-8">Past HeatWise Agent analyses.</p>

      {error && <p className="text-sm text-thermal-critical">{error}</p>}

      {entries && entries.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-ink-muted text-sm">
          No analyses yet. Run one from the Dashboard to see it here.
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          {entries.map((e) => {
            const level = levelFromScore(e.max_risk_score);
            return (
              <div
                key={e.request_id}
                className="flex items-center justify-between px-5 py-4 border-b border-border-soft last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{e.preferred_site}</p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    {new Date(e.generated_at).toLocaleString()} · {e.location_names.length} site(s)
                    {e.demo_mode && " · demo"}
                  </p>
                </div>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0"
                  style={{ borderColor: levelColor(level), color: levelColor(level) }}
                >
                  {level} · {e.max_risk_score}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
