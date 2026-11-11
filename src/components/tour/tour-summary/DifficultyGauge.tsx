import type { Difficulty } from "@/types/tour";

const LEVELS: Difficulty[] = ["easy", "moderate", "hard"];
const R = 24;
const CX = 32;
const CY = 32;

export function DifficultyGauge({ level }: { level: Difficulty }) {
  const index = Math.max(0, LEVELS.indexOf(level));
  const angle = ((180 - (index * 2 + 1) * 30) * Math.PI) / 180;
  const x = CX + R * Math.cos(angle);
  const y = CY - R * Math.sin(angle);

  return (
    <svg className="tour-gauge" viewBox="0 0 64 38" width="64" height="38" aria-hidden="true">
      <defs>
        <linearGradient id="tour-gauge-scale" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path d={`M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="url(#tour-gauge-scale)" strokeWidth="6" strokeLinecap="round" />
      <circle cx={x} cy={y} r="5" className="tour-gauge-marker" />
      <text x={CX} y={CY + 2} textAnchor="middle" className="tour-gauge-value">
        {index + 1}
      </text>
    </svg>
  );
}
