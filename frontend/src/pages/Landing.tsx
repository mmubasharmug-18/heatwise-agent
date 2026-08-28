import { useNavigate } from "react-router-dom";

const PILLARS = [
  {
    tag: "OBSERVE",
    title: "Hyperlocal temperature intelligence",
    body: "HeatWise pulls tile-level heatmap, solar, and land-cover data from FortyGuard for the exact coordinates your team is working — not the nearest airport weather station.",
  },
  {
    tag: "REASON",
    title: "AI-powered multi-dimensional analysis",
    body: "An agent orchestrator weighs temperature, heat index, solar irradiance, canopy, and impervious surface into one transparent Operational Risk Score, and decides when deeper investigation is warranted.",
  },
  {
    tag: "ACT",
    title: "Autonomous recommendations",
    body: "Ranked site comparisons, safe work windows, and a prioritized action plan — every recommendation traces back to the evidence that produced it.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 tile-field" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/60 text-xs font-mono text-ink-muted mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-thermal-high" />
            Built on FortyGuard Temperature Intelligence
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
            HEATWISE
          </h1>
          <p className="mt-3 font-display text-xl md:text-2xl text-ink-muted">
            Autonomous Heat Intelligence
          </p>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-ink-muted leading-relaxed">
            AI-powered hyperlocal heat analysis that turns temperature data into
            safer operational decisions — for the outdoor teams who can't afford
            to guess.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-lg bg-ink text-base font-semibold text-sm hover:bg-white transition-colors"
            >
              Analyze Locations
            </button>
            <button
              onClick={() => navigate("/dashboard?demo=1")}
              className="px-6 py-3 rounded-lg border border-border text-sm font-semibold text-ink-muted hover:text-ink hover:border-ink-faint transition-colors"
            >
              View Demo Scenario
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-5">
          {PILLARS.map((p) => (
            <div
              key={p.tag}
              className="rounded-xl border border-border bg-surface p-6 hover:border-ink-faint transition-colors"
            >
              <div className="text-xs font-mono tracking-widest text-signal mb-4">
                {p.tag}
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-28">
        <div className="rounded-xl border border-border bg-surface/50 p-8 text-center">
          <p className="text-sm text-ink-muted leading-relaxed">
            Protect outdoor workers and organizations by identifying safer
            locations and safer working periods during extreme heat —
            for construction crews, delivery fleets, utility teams, city
            operations, and event organizers.
          </p>
        </div>
      </section>
    </div>
  );
}
