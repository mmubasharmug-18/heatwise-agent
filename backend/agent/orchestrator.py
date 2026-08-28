"""HeatWise Agent orchestrator.

Implements the OBSERVE -> ANALYZE -> INVESTIGATE -> DECIDE -> ACT workflow
described in the product brief, with intelligent tool selection: cheap calls
always run, expensive ones (Heat Intelligence) only run when risk is
HIGH/CRITICAL or explicitly requested.

Falls back to Demo Mode per-location if a live FortyGuard call fails, and
always labels which data source was actually used — it never silently
swaps live data for fake data without saying so.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from agent import demo_data
from agent.decision_engine import (
    build_evidence,
    generate_action_plan,
    recommend_safe_work_window,
    should_run_heat_intelligence,
)
from agent.risk_scoring import RiskComponents, calculate_heat_risk, primary_driver
from models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    DecisionTraceStep,
    HeatIntelligenceInfo,
    LocationIn,
    LocationResult,
)
from services import fortyguard_service as fg
from services.geo import celsius_to_fahrenheit

logger = logging.getLogger("heatwise.orchestrator")

OUTPUTS_DIR = Path(__file__).resolve().parent.parent / "outputs"


class _Trace:
    def __init__(self) -> None:
        self._steps: list[str] = []

    def add(self, description: str) -> None:
        self._steps.append(description)

    def as_list(self) -> list[DecisionTraceStep]:
        return [DecisionTraceStep(step=i + 1, description=d) for i, d in enumerate(self._steps)]


def _analyze_one_location(
    loc: LocationIn,
    req: AnalyzeRequest,
    client_available: bool,
    client: Any,
    trace: _Trace,
) -> LocationResult:
    data_source = "demo"
    used_demo = req.demo_mode or not client_available

    observed: dict[str, Any] = {}
    env: dict[str, Any] = {}
    sat: dict[str, Any] = {}

    if not used_demo:
        try:
            trace.add(f"[{loc.name}] OBSERVE — retrieving hyperlocal temperature intelligence (POST /v1/heatmap).")
            observed = fg.get_site_temperature_c(client, loc.latitude, loc.longitude, req.analysis_date, req.analysis_hour)
            data_source = "live"

            trace.add(f"[{loc.name}] ANALYZE — retrieving environmental parameters (POST /v1/env_params).")
            env = fg.get_environmental_parameters(
                client, loc.latitude, loc.longitude, observed["temperature_c"], req.analysis_date, req.analysis_hour
            )
        except fg.FortyGuardUnavailable as exc:
            logger.warning("Live FortyGuard call failed for %s, falling back to demo: %s", loc.name, exc)
            trace.add(f"[{loc.name}] Live FortyGuard call failed ({exc}); falling back to Demo Mode for this site.")
            used_demo = True
            data_source = "demo"

    if used_demo:
        demo = demo_data.demo_site_for(loc.name, loc.latitude, loc.longitude)
        observed = {"temperature_c": demo["temperature_c"]}
        env = {
            "heat_index_c": demo["heat_index_c"],
            "relative_humidity_pct": demo["relative_humidity_pct"],
            "solar_ghi": demo["solar_ghi"],
            "solar_dni": demo["solar_dni"],
            "solar_dhi": demo["solar_dhi"],
        }
        sat = {"tree_canopy_pct": demo["tree_canopy_pct"], "impervious_pct": demo["impervious_pct"]}
        trace.add(f"[{loc.name}] Using Demo Mode data (Phoenix Outdoor Workforce Scenario baseline).")

    temperature_c = observed["temperature_c"]

    components = RiskComponents(
        temperature_c=temperature_c,
        heat_index_c=env.get("heat_index_c"),
        solar_ghi=env.get("solar_ghi"),
        tree_canopy_pct=sat.get("tree_canopy_pct"),
        impervious_pct=sat.get("impervious_pct"),
    )

    # ANALYZE: satellite context — cheap-ish, always attempt when live, since
    # it directly feeds the risk score's vegetation/impervious terms.
    if not used_demo:
        try:
            trace.add(f"[{loc.name}] ANALYZE — retrieving satellite segmentation for land-cover context (POST /v1/satellite).")
            sat = fg.get_satellite_context(client, loc.latitude, loc.longitude, req.analysis_date, req.analysis_hour)
            components.tree_canopy_pct = sat.get("tree_canopy_pct")
            components.impervious_pct = sat.get("impervious_pct")
        except fg.FortyGuardUnavailable as exc:
            trace.add(f"[{loc.name}] Satellite segmentation unavailable ({exc}); continuing without land-cover context.")

    risk = calculate_heat_risk(components)
    trace.add(f"[{loc.name}] Calculated HeatWise Operational Risk Score: {risk.score} ({risk.level}).")

    evidence = build_evidence(components, risk)
    driver = primary_driver(risk, components)

    # INVESTIGATE: intelligent tool selection for the expensive Heat Intelligence report.
    run_hi, categories, hi_reason = should_run_heat_intelligence(risk.level, req.deep_investigation)
    trace.add(f"[{loc.name}] Tool-selection decision: {hi_reason}")

    hi_info = HeatIntelligenceInfo(requested=run_hi, categories=categories, reason=hi_reason)
    if run_hi and not used_demo:
        try:
            trace.add(f"[{loc.name}] INVESTIGATE — generating targeted Heat Intelligence report ({', '.join(categories)}).")
            OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
            hi_result = fg.generate_heat_intelligence_report(
                client, loc.latitude, loc.longitude, temperature_c, req.analysis_date, categories, str(OUTPUTS_DIR)
            )
            pdf_path = Path(hi_result["pdf_path"])
            hi_info.pdf_available = True
            hi_info.pdf_relative_path = pdf_path.name
            trace.add(f"[{loc.name}] Deep investigation complete — report saved.")
        except fg.FortyGuardUnavailable as exc:
            trace.add(f"[{loc.name}] Heat Intelligence report unavailable ({exc}); proceeding with available signals only.")
    elif run_hi and used_demo:
        trace.add(f"[{loc.name}] Heat Intelligence would run in live mode; skipped under Demo Mode.")

    # DECIDE / ACT
    work_windows = recommend_safe_work_window(risk.level, req.analysis_hour)
    action_plan = generate_action_plan(risk.level, evidence)

    recommended_action = action_plan[0].action if action_plan else "Continue monitoring."

    return LocationResult(
        name=loc.name,
        latitude=loc.latitude,
        longitude=loc.longitude,
        temperature_c=round(temperature_c, 1),
        temperature_f=round(celsius_to_fahrenheit(temperature_c), 1),
        risk_score=risk.score,
        risk_level=risk.level,
        primary_driver=driver,
        recommended_action=recommended_action,
        evidence=evidence,
        work_windows=work_windows,
        action_plan=action_plan,
        heat_intelligence=hi_info,
        solar_ghi=env.get("solar_ghi"),
        solar_dni=env.get("solar_dni"),
        solar_dhi=env.get("solar_dhi"),
        tree_canopy_pct=components.tree_canopy_pct,
        impervious_pct=components.impervious_pct,
        data_source=data_source,
    )


def run_analysis(req: AnalyzeRequest) -> AnalyzeResponse:
    trace = _Trace()
    trace.add("Agent initialized. Received request for "
               f"{len(req.locations)} location(s), analysis date {req.analysis_date.isoformat()}.")

    client = None
    client_available = False
    if not req.demo_mode:
        try:
            client = fg.get_client()
            client_available = True
            trace.add("FortyGuard API client authenticated successfully.")
        except fg.FortyGuardUnavailable as exc:
            trace.add(f"No live FortyGuard API access ({exc}); entire analysis will run in Demo Mode.")

    results = [
        _analyze_one_location(loc, req, client_available, client, trace)
        for loc in req.locations
    ]

    results_sorted = sorted(results, key=lambda r: r.risk_score)
    preferred = results_sorted[0]

    if len(results) > 1:
        trace.add(
            f"Compared {len(results)} locations by Operational Risk Score. "
            f"Ranked '{preferred.name}' as preferred (score {preferred.risk_score})."
        )
        decision_summary = (
            f"HeatWise selected {preferred.name} because it shows the lowest combined "
            f"heat exposure and environmental risk among the {len(results)} sites analyzed "
            f"(driver: {preferred.primary_driver.lower()})."
        )
    else:
        decision_summary = (
            f"{preferred.name} carries {preferred.risk_level.lower()} operational heat risk "
            f"(score {preferred.risk_score}), primarily driven by {preferred.primary_driver.lower()}."
        )

    trace.add("Generated autonomous action plan(s) and recommended work windows for all sites.")

    demo_mode_effective = req.demo_mode or not client_available

    return AnalyzeResponse(
        request_id=str(uuid.uuid4()),
        generated_at=datetime.now(timezone.utc).isoformat(),
        demo_mode=demo_mode_effective,
        preferred_site=preferred.name,
        decision_summary=decision_summary,
        results=results_sorted,
        decision_trace=trace.as_list(),
    )
