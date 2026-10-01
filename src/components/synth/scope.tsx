import { useEffect, useRef } from "react";
import { getEngine } from "@/lib/synth/engine";

export function Scope({ armed }: { armed: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const armedRef = useRef(armed);
  armedRef.current = armed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let levelSmooth = 0;

    const paint = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const css = getComputedStyle(document.documentElement);
      const accent = css.getPropertyValue("--color-accent").trim() || "#c43428";
      const grid = css.getPropertyValue("--color-border").trim() || "#3d312b";
      const bg = css.getPropertyValue("--color-bg").trim() || "#100c0b";
      const meterW = Math.max(8, Math.floor(w * 0.035));
      const gap = Math.floor(w * 0.02);
      const plotW = w - meterW - gap;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = grid;
      ctx.lineWidth = Math.max(1, dpr);
      ctx.beginPath();
      for (let i = 1; i < 4; i++) {
        const y = (h / 4) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(plotW, y);
      }
      ctx.stroke();

      let level = 0;
      if (armedRef.current) {
        const frame = getEngine().readFrame();
        const time = frame.time;
        level = frame.level;
        ctx.beginPath();
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(1.5, dpr * 1.4);
        ctx.lineJoin = "round";
        for (let i = 0; i < time.length; i++) {
          const v = ((time[i] ?? 128) - 128) / 128;
          const x = (i / Math.max(1, time.length - 1)) * plotW;
          const y = h / 2 - v * h * 0.46;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.strokeStyle = grid;
        ctx.moveTo(0, h / 2);
        ctx.lineTo(plotW, h / 2);
        ctx.stroke();
      }

      levelSmooth = levelSmooth * 0.72 + level * 0.28;
      ctx.fillStyle = grid;
      ctx.fillRect(plotW + gap, 0, meterW, h);
      const fill = Math.max(dpr * 2, levelSmooth * h);
      ctx.fillStyle = accent;
      ctx.fillRect(plotW + gap, h - fill, meterW, fill);

      raf = requestAnimationFrame(paint);
    };

    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between text-xs tracking-widest text-muted">
        <span>Scope</span>
        <span>Level</span>
      </div>
      <canvas ref={canvasRef} className="h-24 w-full rounded-lg border border-border md:h-32" />
    </div>
  );
}
