"""WHY-focused decision components: evidence signals, safe work windows,
and the autonomous action plan. Framed throughout as operational
recommendations, not medical guidance.
"""
from __future__ import annotations

from typing import Optional

from agent.risk_scoring import RiskComponents, RiskResult, WEIGHTS
from models.schemas import ActionPlanItem, EvidenceSignal, RiskLevel, WorkWindow


def build_evidence(components: RiskComponents, risk: RiskResult) -> list[EvidenceSignal]:
    evidence: list[EvidenceSignal] = []

    if components.temperature_c >= 35:
        evidence.append(EvidenceSignal(
            label="High temperature exposure",
            direction="up",
            detail=f"Hyperlocal temperature measured at {components.temperature_c:.1f}°C.",
        ))
    elif components.temperature_c <= 27:
        evidence.append(EvidenceSignal(
            label="Moderate temperature",
            direction="neutral",
            detail=f"Hyperlocal temperature measured at {components.temperature_c:.1f}°C.",
        ))

    if components.heat_index_c is not None:
        if components.heat_index_c >= 39:
            evidence.append(EvidenceSignal(
                label="Elevated heat index",
                direction="up",
                detail=f"Heat index of {components.heat_index_c:.1f}°C indicates significant thermal stress.",
            ))

    if components.solar_ghi is not None:
        if components.solar_ghi >= 700:
            evidence.append(EvidenceSignal(
                label="Strong solar irradiance",
                direction="up",
                detail=f"Clear-sky GHI of {components.solar_ghi:.0f} W/m² indicates strong direct-sun exposure.",
            ))
        elif components.solar_ghi <= 250:
            evidence.append(EvidenceSignal(
                label="Low solar exposure",
                direction="down",
                detail=f"Clear-sky GHI of {components.solar_ghi:.0f} W/m² is comparatively low.",
            ))

    if components.tree_canopy_pct is not None:
        if components.tree_canopy_pct < 10:
            evidence.append(EvidenceSignal(
                label="Limited tree coverage",
                direction="down",
                detail=f"Satellite segmentation shows only {components.tree_canopy_pct:.1f}% canopy/vegetation coverage.",
            ))
        elif components.tree_canopy_pct >= 25:
            evidence.append(EvidenceSignal(
                label="Meaningful shade coverage",
                direction="down",
                detail=f"Satellite segmentation shows {components.tree_canopy_pct:.1f}% canopy/vegetation coverage, offering some protection.",
            ))

    if components.impervious_pct is not None and components.impervious_pct >= 60:
        evidence.append(EvidenceSignal(
            label="Urban heat retention",
            direction="up",
            detail=f"Impervious surface coverage of {components.impervious_pct:.1f}% (buildings/pavement) tends to retain and re-radiate heat.",
        ))

    if not evidence:
        evidence.append(EvidenceSignal(
            label="No significant heat stress signals",
            direction="neutral",
            detail="Available signals are within typical operational ranges.",
        ))

    return evidence


def recommend_safe_work_window(risk_level: RiskLevel, peak_hour: str) -> list[WorkWindow]:
    """Generate an operational heat-risk work-window timeline around the
    requested analysis hour. Framed as operational guidance, not medical advice.
    """
    try:
        peak_h = int(peak_hour.split(":")[0])
    except (ValueError, IndexError):
        peak_h = 14

    def fmt(h: int) -> str:
        h = h % 24
        return f"{h:02d}:00"

    if risk_level in ("LOW", "MODERATE"):
        return [
            WorkWindow(label="BEST", start="07:00", end=fmt(peak_h - 2), note="Favorable conditions for full-exposure outdoor work."),
            WorkWindow(label="CAUTION", start=fmt(peak_h - 2), end=fmt(peak_h + 1), note="Increase hydration and monitor conditions."),
            WorkWindow(label="RECOVERY", start=fmt(peak_h + 3), end="19:00", note="Conditions ease; suitable for resuming work."),
        ]

    # HIGH or CRITICAL
    return [
        WorkWindow(label="BEST", start="06:00", end="09:30", note="Coolest window of the day; prioritize high-exposure tasks here."),
        WorkWindow(label="CAUTION", start="09:30", end=fmt(peak_h - 2), note="Rising heat; shift to shaded or lower-exertion tasks."),
        WorkWindow(label="AVOID", start=fmt(peak_h - 2), end=fmt(peak_h + 2), note="Peak heat window; avoid high-exposure outdoor work where operationally feasible."),
        WorkWindow(label="RECOVERY", start=fmt(peak_h + 3), end="19:00", note="Conditions ease; resume with continued hydration monitoring."),
    ]


def generate_action_plan(risk_level: RiskLevel, evidence: list[EvidenceSignal]) -> list[ActionPlanItem]:
    signals_used = [f"{e.label}: {e.detail}" for e in evidence]

    if risk_level == "LOW":
        return [ActionPlanItem(
            priority="LOW",
            action="Continue routine monitoring.",
            reason="Current signals fall within typical operational ranges; no elevated heat exposure detected.",
            supporting_data=signals_used,
        )]

    if risk_level == "MODERATE":
        return [ActionPlanItem(
            priority="MEDIUM",
            action="Increase hydration frequency and schedule additional short breaks.",
            reason="Elevated but manageable heat signals suggest added precaution without disrupting operations.",
            supporting_data=signals_used,
        )]

    if risk_level == "HIGH":
        return [
            ActionPlanItem(
                priority="HIGH",
                action="Reschedule high-exposure tasks outside the AVOID window and prioritize shaded locations.",
                reason="Multiple heat and solar signals indicate meaningful operational risk during peak hours.",
                supporting_data=signals_used,
            ),
            ActionPlanItem(
                priority="HIGH",
                action="Increase hydration cadence and add mandatory shade breaks every 30-45 minutes during CAUTION windows.",
                reason="Sustained exposure risk requires structured recovery periods.",
                supporting_data=signals_used,
            ),
        ]

    # CRITICAL
    return [
        ActionPlanItem(
            priority="CRITICAL",
            action="Postpone or relocate high-exposure outdoor tasks where operationally feasible.",
            reason="Combined temperature, solar, and environmental signals indicate severe operational heat risk.",
            supporting_data=signals_used,
        ),
        ActionPlanItem(
            priority="CRITICAL",
            action="If work cannot be postponed, restrict to the BEST window only, with continuous hydration and buddy-system monitoring.",
            reason="Peak-hour exposure at this risk level carries substantial operational risk.",
            supporting_data=signals_used,
        ),
    ]


def should_run_heat_intelligence(risk_level: RiskLevel, force: bool) -> tuple[bool, list[str], str]:
    """Agent's tool-selection logic: decide whether to spend credits on the
    full Heat Intelligence report, and which analysis categories to request.
    """
    if force:
        return True, ["geographic", "environmental", "urban", "events", "anthropogenic"], (
            "Deep investigation explicitly requested by the user."
        )
    if risk_level == "CRITICAL":
        return True, ["geographic", "environmental", "urban"], (
            "CRITICAL risk detected — investigating geographic, environmental, "
            "and urban drivers to explain the risk and support the action plan."
        )
    if risk_level == "HIGH":
        return True, ["environmental", "urban"], (
            "HIGH risk detected — retrieving environmental and urban context "
            "to identify the primary heat driver."
        )
    return False, [], (
        f"{risk_level} risk does not warrant a full Heat Intelligence report; "
        "skipping to conserve API credits."
    )
