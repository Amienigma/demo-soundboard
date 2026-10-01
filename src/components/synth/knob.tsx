import { useRef } from "react";

type KnobProps = {
  label: string;
  value: number;
  display: string;
  onChange: (value: number) => void;
};

export function Knob({ label, value, display, onChange }: KnobProps) {
  const drag = useRef<{ y: number; v: number; fine: boolean } | null>(null);
  const angle = -135 + value * 270;

  return (
    <div
      className="knob focus-ring flex flex-col items-center gap-1"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={display}
      data-knob=""
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { y: e.clientY, v: value, fine: e.shiftKey };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const span = e.shiftKey || d.fine ? 420 : 140;
        const next = Math.min(1, Math.max(0, d.v + (d.y - e.clientY) / span));
        onChange(next);
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 0.01 : 0.03;
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
          e.preventDefault();
          onChange(Math.min(1, value + step));
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
          e.preventDefault();
          onChange(Math.max(0, value - step));
        } else if (e.key === "Home") {
          e.preventDefault();
          onChange(0);
        } else if (e.key === "End") {
          e.preventDefault();
          onChange(1);
        }
      }}
    >
      <div className="relative size-14 rounded-full border border-border bg-raised">
        <div className="absolute inset-1 rounded-full bg-surface" />
        <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
        </div>
      </div>
      <span className="text-xs tracking-widest text-muted">{label}</span>
      <span className="text-xs text-fg">{display}</span>
    </div>
  );
}
