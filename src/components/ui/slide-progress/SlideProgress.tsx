import type { CSSProperties } from "react";
import "./slide-progress.css";

export function SlideProgress({
  labels,
  index,
  duration,
  paused,
  onSelect,
}: {
  labels: string[];
  index: number;
  duration: number;
  paused: boolean;
  onSelect: (index: number) => void;
}) {
  if (labels.length < 2) return null;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="slide-progress">
      <span className="slide-progress-counter" aria-hidden="true">
        <strong className="slide-progress-current">{pad(index + 1)}</strong> / {pad(labels.length)}
      </span>
      <div className="slide-progress-bars">
        {labels.map((label, i) => (
          <button
            key={`${label}-${i}`}
            type="button"
            className="slide-progress-item"
            onClick={() => onSelect(i)}
            aria-label={label}
            aria-current={i === index ? "true" : undefined}
          >
            <span className="slide-progress-label">{label}</span>
            <span className="slide-progress-track">
              <span
                key={i === index ? `active-${index}` : `idle-${i}`}
                className={[
                  "slide-progress-fill",
                  i < index ? "slide-progress-fill-done" : "",
                  i === index ? "slide-progress-fill-active" : "",
                  i === index && paused ? "slide-progress-fill-paused" : "",
                ].join(" ")}
                style={{ "--slide-duration": `${duration}ms` } as CSSProperties}
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
