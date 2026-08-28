import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import LocationInputList from "../components/LocationInputList";
import AgentActivityPanel from "../components/AgentActivityPanel";
import { DecisionHero, RiskScoreCard, ComparisonTable } from "../components/ResultsOverview";
import EvidencePanel from "../components/EvidencePanel";
import WorkWindowTimeline from "../components/WorkWindowTimeline";
import ActionPlanList from "../components/ActionPlanList";
import { DecisionTracePanel, HeatIntelligenceBadge } from "../components/DecisionTracePanel";
import { PHOENIX_DEMO_SCENARIO } from "../lib/demoScenario";
import { api } from "../lib/api";
import type { AnalyzeResponse, LocationIn } from "../types/api";

type Stage = "input" | "loading" | "results" | "error";

// FortyGuard's temperature catalog can lag behind today by a day or more —
// confirmed empirically (a live request for today's date returned zero
// tiles while the identical request for a recent past date returned full
// results). Default a few days back so a fresh analysis works out of the box.
function defaultAnalysisDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 3);
  return d.toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [params] = useSearchParams();
  const isDemoQuery = params.get("demo") === "1";

  const [locations, setLocations] = useState<LocationIn[]>(
    isDemoQuery ? PHOENIX_DEMO_SCENARIO : [{ name: "", latitude: 0, longitude: 0 }]
  );
  const [demoMode, setDemoMode] = useState(isDemoQuery);
  const [deepInvestigation, setDeepInvestigation] = useState(false);
  const [analysisDate, setAnalysisDate] = useState(defaultAnalysisDate());
  const [stage, setStage] = useState<Stage>("input");
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const validLocations = locations.filter(
    (l) => l.name.trim() && (l.latitude !== 0 || l.longitude !== 0)
  );

  async function runAnalysis() {
    setStage("loading");
    setError(null);
    try {
      const resp = await api.analyze({
        locations: validLocations,
        analysis_date: analysisDate,
        analysis_hour: "14:00",
        deep_investigation: deepInvestigation,
        demo_mode: demoMode,
      });
      // Keep the loading sequence visible briefly so the agent activity reads as real work.
      setTimeout(() => {
        setResponse(resp);
        setSelectedIdx(0);
        setStage("results");
      }, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      setStage("error");
    }
  }

  function loadDemo() {
    setLocations(PHOENIX_DEMO_SCENARIO);
    setDemoMode(true);
  }

  function reset() {
    setStage("input");
    setResponse(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Heat Intelligence Command Center
        </h1>
        <p className="text-ink-muted mt-2">
          Analyze hyperlocal heat risk and generate autonomous operational decisions.
        </p>
      </header>

      {stage === "input" && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-ink-muted">Locations</h2>
            <button onClick={loadDemo} className="text-xs text-signal hover:underline">
              Load Phoenix demo scenario
            </button>
          </div>
          <LocationInputList locations={locations} onChange={setLocations} />

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm">
            <label className="flex items-center gap-2 text-ink-muted">
              Analysis date
              <input
                type="date"
                value={analysisDate}
                onChange={(e) => setAnalysisDate(e.target.value)}
                className="bg-transparent border-b border-border-soft focus:border-signal outline-none text-ink font-mono px-1"
              />
            </label>
            <label className="flex items-center gap-2 text-ink-muted cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="accent-signal"
              />
              Demo mode
            </label>
            <label className="flex items-center gap-2 text-ink-muted cursor-pointer">
              <input
                type="checkbox"
                checked={deepInvestigation}
                onChange={(e) => setDeepInvestigation(e.target.checked)}
                className="accent-signal"
              />
              Force deep Heat Intelligence investigation
            </label>
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            FortyGuard's temperature catalog can lag behind today by a day or more — if live
            analysis returns no data, try an earlier date.
          </p>

          <button
            disabled={validLocations.length === 0}
            onClick={runAnalysis}
            className="mt-8 w-full sm:w-auto px-8 py-3.5 rounded-lg bg-ink text-base font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            ⚡ Analyze with HeatWise Agent
          </button>
        </div>
      )}

      {stage === "loading" && (
        <div className="py-16">
          <AgentActivityPanel />
        </div>
      )}

      {stage === "error" && (
        <div className="max-w-lg rounded-xl border border-thermal-critical/40 bg-thermal-critical/5 p-6">
          <p className="text-sm text-thermal-critical font-medium mb-1">Analysis could not be completed.</p>
          <p className="text-sm text-ink-muted mb-4">{error}</p>
          <button onClick={reset} className="text-sm text-signal hover:underline">
            Try again
          </button>
        </div>
      )}

      {stage === "results" && response && (
        <div className="space-y-8">
          {response.demo_mode && (
            <div className="rounded-lg border border-thermal-moderate/40 bg-thermal-moderate/5 px-4 py-2.5 text-xs text-thermal-moderate font-mono">
              DEMO DATA — not live API results
            </div>
          )}

          <DecisionHero preferredSite={response.preferred_site} decisionSummary={response.decision_summary} />

          <ComparisonTable results={response.results} />

          <div className="flex flex-wrap gap-2">
            {response.results.map((r, i) => (
              <button
                key={r.name}
                onClick={() => setSelectedIdx(i)}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  selectedIdx === i
                    ? "border-signal text-ink bg-signal/10"
                    : "border-border text-ink-muted hover:text-ink"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {response.results[selectedIdx] && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <RiskScoreCard result={response.results[selectedIdx]} />
                <EvidencePanel evidence={response.results[selectedIdx].evidence} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <WorkWindowTimeline windows={response.results[selectedIdx].work_windows} />
                <ActionPlanList items={response.results[selectedIdx].action_plan} />
              </div>
              <HeatIntelligenceBadge info={response.results[selectedIdx].heat_intelligence} />
            </div>
          )}

          <DecisionTracePanel trace={response.decision_trace} />

          <button onClick={reset} className="text-sm text-signal hover:underline">
            ← Run a new analysis
          </button>
        </div>
      )}
    </div>
  );
}