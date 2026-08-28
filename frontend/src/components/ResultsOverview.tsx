import type { LocationResult } from "../types/api";
import { ThermalScale, levelColor } from "./ThermalScale";

const MEDALS = ["🥇", "🥈", "🥉", "4th", "5th"];

export function DecisionHero({
  preferredSite,
  decisionSummary,
}: {
  preferredSite: string;
  decisionSummary: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <div className="text-4xl mb-3">🥇</div>
      <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-3">
        {preferredSite.toUpperCase()} IS THE PREFERRED LOCATION
      </h2>
      <p className="max-w-2xl mx-auto text-sm text-ink-muted leading-relaxed">
        {decisionSummary}
      </p>
    </div>
  );
}

export function RiskScoreCard({ result }: { result: LocationResult }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs font-mono tracking-widest text-ink-muted">
          HEATWISE OPERATIONAL RISK
        </span>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
          style={{ borderColor: levelColor(result.risk_level), color: levelColor(result.risk_level) }}
        >
          {result.risk_level}
        </span>
      </div>
      <div className="flex items-end gap-3 mb-5">
        <span className="font-display text-5xl font-semibold">{result.risk_score}</span>
        <span className="text-sm text-ink-muted pb-1">/ 100</span>
      </div>
      <ThermalScale score={result.risk_score} size="lg" />
      <p className="mt-4 text-xs text-ink-faint">
        {result.temperature_f.toFixed(1)}°F ({result.temperature_c.toFixed(1)}°C) ·{" "}
        {result.data_source === "demo" ? "Demo data — not live API results" : "Live FortyGuard data"}
      </p>
    </div>
  );
}

export function ComparisonTable({ results }: { results: LocationResult[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-mono text-ink-muted tracking-wide">
            <th className="px-5 py-3 font-medium">Location</th>
            <th className="px-5 py-3 font-medium">Risk score</th>
            <th className="px-5 py-3 font-medium hidden sm:table-cell">Level</th>
            <th className="px-5 py-3 font-medium hidden md:table-cell">Primary driver</th>
            <th className="px-5 py-3 font-medium">Recommended action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={r.name} className="border-b border-border-soft last:border-0">
              <td className="px-5 py-4 align-top">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{MEDALS[i] ?? i + 1}</span>
                  <span className="font-medium">{r.name}</span>
                </div>
              </td>
              <td className="px-5 py-4 align-top w-40">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{r.risk_score}</span>
                  <div className="flex-1">
                    <ThermalScale score={r.risk_score} size="sm" />
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 align-top hidden sm:table-cell">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ borderColor: levelColor(r.risk_level), color: levelColor(r.risk_level) }}
                >
                  {r.risk_level}
                </span>
              </td>
              <td className="px-5 py-4 align-top text-ink-muted hidden md:table-cell max-w-xs">
                {r.primary_driver}
              </td>
              <td className="px-5 py-4 align-top text-ink-muted max-w-xs">{r.recommended_action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
