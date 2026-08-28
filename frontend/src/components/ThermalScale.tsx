import type { RiskLevel } from "../types/api";

const LEVEL_COLOR: Record<RiskLevel, string> = {
  LOW: "#3DDC97",
  MODERATE: "#F5C244",
  HIGH: "#FF8A3D",
  CRITICAL: "#FF4757",
};

export function levelColor(level: RiskLevel): string {
  return LEVEL_COLOR[level];
}

interface ThermalScaleProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
}

/**
 * HeatWise's signature visual device: a literal thermal gradient scale with
 * a marker at the current score, echoing the product's core subject
 * (temperature) rather than a generic colored badge.
 */
export function ThermalScale({ score, size = "md" }: ThermalScaleProps) {
  const height = size === "lg" ? "h-3" : size === "sm" ? "h-1.5" : "h-2";
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className="w-full">
      <div className={`relative w-full ${height} rounded-full bg-thermal-scale overflow-visible`}>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-base border-2 border-ink shadow-[0_0_0_3px_rgba(0,0,0,0.4)]"
          style={{ left: `${clamped}%` }}
          aria-hidden
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-ink-faint mt-1.5 tracking-wide">
        <span>0 LOW</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100 CRITICAL</span>
      </div>
    </div>
  );
}
