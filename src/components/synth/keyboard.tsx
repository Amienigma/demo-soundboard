import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { COMPUTER_KEYS, keyCap, noteName } from "@/lib/synth/music";

type Press = "off" | "exact" | "cousin";

type KeyboardProps = {
  octave: number;
  active: number[];
  onOctave: (octave: number) => void;
  onDown: (midi: number) => void;
  onUp: (midi: number) => void;
  onCut: () => void;
};

const MIN_OCT = 1;
const MAX_OCT = 5;

function pressOf(midi: number, active: number[]): Press {
  return active.includes(midi) ? "exact" : "off";
}

export function Keyboard({ octave, active, onOctave, onDown, onUp, onCut }: KeyboardProps) {
  const [wide, setWide] = useState(false);
  const downRef = useRef(onDown);
  const upRef = useRef(onUp);
  const octaveRef = useRef(onOctave);
  const cutRef = useRef(onCut);
  downRef.current = onDown;
  upRef.current = onUp;
  octaveRef.current = onOctave;
  cutRef.current = onCut;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const held = new Map<string, number>();
    const limit = () => (wide ? 18 : 12);
    const base = () => 12 * (octave + 1);

    const editable = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest("[data-knob], input, textarea")) return true;
      return false;
    };

    const releaseAll = () => {
      for (const midi of held.values()) upRef.current(midi);
      held.clear();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || editable(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === "arrowleft" || key === "z") {
        e.preventDefault();
        if (!e.repeat) octaveRef.current(Math.max(MIN_OCT, octave - 1));
        return;
      }
      if (key === "arrowright" || key === "x") {
        e.preventDefault();
        if (!e.repeat) octaveRef.current(Math.min(MAX_OCT, octave + 1));
        return;
      }
      if (key === "escape") {
        e.preventDefault();
        releaseAll();
        cutRef.current();
        return;
      }
      const idx = COMPUTER_KEYS.indexOf(key as (typeof COMPUTER_KEYS)[number]);
      if (idx < 0 || idx >= limit()) return;
      e.preventDefault();
      if (e.repeat || held.has(key)) return;
      const midi = base() + idx;
      held.set(key, midi);
      downRef.current(midi);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const midi = held.get(key);
      if (midi === undefined) return;
      held.delete(key);
      upRef.current(midi);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
      releaseAll();
    };
  }, [octave, wide]);

  const base = 12 * (octave + 1);
  const span = wide ? 18 : 12;
  const range = `${noteName(base)}–${noteName(base + span - 1)}`;
  const whites = buildWhites(base);

  return (
    <footer className="border-t border-border bg-surface pb-safe">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="focus-ring inline-flex size-11 items-center justify-center rounded-md border border-border bg-bg text-fg disabled:opacity-40"
            aria-label="Octave down"
            disabled={octave <= MIN_OCT}
            onClick={() => onOctave(octave - 1)}
          >
            <Minus className="size-4" />
          </button>
          <div className="w-12 text-center">
            <div className="font-display text-xl leading-none">C{octave}</div>
            <div className="text-xs text-muted">{range}</div>
          </div>
          <button
            type="button"
            className="focus-ring inline-flex size-11 items-center justify-center rounded-md border border-border bg-bg text-fg disabled:opacity-40"
            aria-label="Octave up"
            disabled={octave >= MAX_OCT}
            onClick={() => onOctave(octave + 1)}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <p className="hidden text-xs text-muted sm:block">
          {wide ? "A–J this octave, K through quote the next. Z/X shift." : "A–J play these keys. Z/X shift octave."}
        </p>
        <p className="text-xs text-muted sm:hidden">Z/X octave</p>
      </div>
      <div className="flex h-36 justify-center px-1 pb-2 md:h-44">
        {whites.map((key) => (
          <div
            key={key.midi}
            className={`relative h-full min-w-0 flex-1 ${key.offset >= 12 ? "hidden max-w-24 md:block" : "max-w-24"}`}
          >
            <KeyButton
              midi={key.midi}
              label={noteName(key.midi)}
              cap={key.offset < span ? keyCap(COMPUTER_KEYS[key.offset] ?? "") : ""}
              kind="white"
              press={pressOf(key.midi, active)}
              onDown={onDown}
              onUp={onUp}
            />
            {key.black ? (
              <KeyButton
                midi={key.black.midi}
                label={noteName(key.black.midi)}
                cap={key.black.offset < span ? keyCap(COMPUTER_KEYS[key.black.offset] ?? "") : ""}
                kind="black"
                press={pressOf(key.black.midi, active)}
                onDown={onDown}
                onUp={onUp}
              />
            ) : null}
          </div>
        ))}
      </div>
    </footer>
  );
}

function KeyButton({
  midi,
  label,
  cap,
  kind,
  press,
  onDown,
  onUp,
}: {
  midi: number;
  label: string;
  cap: string;
  kind: "white" | "black";
  press: Press;
  onDown: (midi: number) => void;
  onUp: (midi: number) => void;
}) {
  const state = press === "exact" ? "key-exact" : press === "cousin" ? "key-cousin" : "";
  return (
    <button
      type="button"
      data-midi={midi}
      aria-label={label}
      aria-pressed={press !== "off"}
      className={`key focus-ring ${kind === "white" ? "key-white h-full w-full" : "key-black"} ${state}`}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown(midi);
      }}
      onPointerUp={() => onUp(midi)}
      onPointerCancel={() => onUp(midi)}
    >
      <span className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
        {cap ? <span className="font-medium">{cap}</span> : null}
        <span>{kind === "black" ? label.replace(/\d/, "") : label}</span>
      </span>
    </button>
  );
}

function buildWhites(base: number) {
  const whites: { midi: number; offset: number; black?: { midi: number; offset: number } }[] = [];
  for (let i = 0; i < 24; i++) {
    const semi = i % 12;
    if ([1, 3, 6, 8, 10].includes(semi)) continue;
    const hasBlack = [0, 2, 5, 7, 9].includes(semi) && i + 1 < 24;
    whites.push({
      midi: base + i,
      offset: i,
      black: hasBlack ? { midi: base + i + 1, offset: i + 1 } : undefined,
    });
  }
  return whites;
}
