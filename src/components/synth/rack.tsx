import { useEffect, useRef, useState } from "react";
import { Power, Repeat, Square } from "lucide-react";
import { getEngine } from "@/lib/synth/engine";
import { Keyboard } from "@/components/synth/keyboard";
import { Knob } from "@/components/synth/knob";
import { Scope } from "@/components/synth/scope";
import {
  DEFAULT_PATCH,
  WAVES,
  formatHz,
  formatTime,
  hitById,
  hitsIn,
  logMap,
  majorityOctave,
  noteName,
  sanitizePatch,
  toMusical,
  withTone,
  ATT_MAX,
  ATT_MIN,
  DEC_MAX,
  DEC_MIN,
  REL_MAX,
  REL_MIN,
  type BankId,
  type Hit,
  type Patch,
} from "@/lib/synth/music";

const STORAGE = "808-pit-rack";

export function Rack() {
  const [patch, setPatch] = useState<Patch>(DEFAULT_PATCH);
  const [octave, setOctave] = useState(3);
  const [bank, setBank] = useState<BankId>("atlanta");
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState<number[]>([]);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [loopId, setLoopId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const patchRef = useRef(patch);
  patchRef.current = patch;

  useEffect(() => {
    const eng = getEngine();
    eng.onNotes = (notes) => setActive(notes);
    return () => {
      eng.onNotes = () => {};
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const data = JSON.parse(raw) as { patch?: unknown; octave?: unknown; bank?: unknown };
        const next = sanitizePatch(data.patch);
        patchRef.current = next;
        setPatch(next);
        if (typeof data.octave === "number" && data.octave >= 1 && data.octave <= 5) {
          setOctave(data.octave);
        }
        if (data.bank === "memphis" || data.bank === "atlanta") setBank(data.bank);
      }
    } catch {
      /* keep defaults */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE, JSON.stringify({ patch, octave, bank }));
  }, [ready, patch, octave, bank]);

  function update(partial: Partial<Patch>) {
    const next = { ...patchRef.current, ...partial };
    patchRef.current = next;
    setPatch(next);
    const eng = getEngine();
    if (eng.armed) eng.setPatch(toMusical(next));
  }

  function armNow() {
    const eng = getEngine();
    if (!eng.arm()) return false;
    eng.setPatch(toMusical(patchRef.current));
    setArmed(true);
    return true;
  }

  function cut() {
    getEngine().allOff();
    setHeldId(null);
    setLoopId(null);
  }

  function power() {
    if (!armed) {
      armNow();
      return;
    }
    cut();
  }

  function down(midi: number) {
    if (!armNow()) return;
    getEngine().down(midi, "key");
  }

  function up(midi: number) {
    getEngine().up(midi, "key");
  }

  function play(hit: Hit) {
    if (!armNow()) return;
    const next = withTone(patchRef.current, hit.tone);
    patchRef.current = next;
    setPatch(next);
    getEngine().setPatch(toMusical(next));

    if (hit.kind === "loop" && hit.steps) {
      if (loopId === hit.id) {
        getEngine().stopLoop();
        setLoopId(null);
        return;
      }
      const focus = hit.steps[0] ?? [];
      if (focus.length) setOctave(majorityOctave(focus));
      getEngine().stopLoop();
      getEngine().releaseOwnerPrefix("pad:");
      setHeldId(null);
      getEngine().startLoop(hit.steps, hit.stepMs ?? 480, hit.gate ?? 0.8);
      setLoopId(hit.id);
      return;
    }

    const focus = hit.notes ?? [];
    if (focus.length) setOctave(majorityOctave(focus));
    getEngine().stopLoop();
    setLoopId(null);
    for (const n of hit.notes ?? []) getEngine().down(n, `pad:${hit.id}`);
    setHeldId(hit.id);
  }

  function release(hit: Hit) {
    if (hit.kind === "loop") return;
    for (const n of hit.notes ?? []) getEngine().up(n, `pad:${hit.id}`);
    setHeldId((id) => (id === hit.id ? null : id));
  }

  const shown = hitById(heldId) ?? hitById(loopId);
  const musical = toMusical(patch);
  const title = lcdTitle(shown, active, armed);
  const sub = shown
    ? shown.detail
    : active.length
      ? active.map(noteName).join(" · ")
      : armed
        ? "Play the keys, or hold a pad."
        : "Audio stays off until you touch power, a pad, or a key.";

  const notes = hitsIn(bank, "note");
  const chords = hitsIn(bank, "chord");
  const loops = hitsIn(bank, "loop");

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <div className="h-1 bg-accent" />
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl leading-none tracking-wide">808 PIT</h1>
          <p className="mt-1 truncate text-xs tracking-widest text-muted">Atlanta subs · Memphis stabs</p>
        </div>
        <label className="flex w-24 shrink-0 flex-col gap-1 text-xs tracking-widest text-muted">
          Vol
          <input
            className="fader"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={patch.volume}
            aria-label="Volume"
            onChange={(e) => update({ volume: Number(e.target.value) })}
          />
        </label>
        <button
          type="button"
          className={`focus-ring inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm ${
            armed ? "border border-border bg-surface text-fg" : "bg-accent text-fg"
          }`}
          onClick={power}
        >
          {armed ? <Square className="size-4" /> : <Power className="size-4" />}
          {armed ? "Cut" : "Power"}
        </button>
      </header>

      {!armed ? (
        <p className="border-b border-border bg-surface px-4 py-2 text-xs text-muted">
          Nothing sounds until a touch. Power, a pad, or any key arms the rack.
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
          <div className="lcd min-w-0 rounded-lg px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate font-display text-4xl tracking-wide">{title}</p>
              <p className={`shrink-0 text-xs tracking-widest ${armed ? "text-accent" : "text-muted"}`}>
                {armed ? "Live" : "Off"}
              </p>
            </div>
            <p className="mt-1 truncate text-xs text-muted">{sub}</p>
          </div>
          <Scope armed={armed} />
        </div>

        <div className="px-4 pb-4">
          <p className="mb-2 text-xs tracking-widest text-muted">Wave</p>
          <div role="radiogroup" aria-label="Waveform" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {WAVES.map((wave) => {
              const on = patch.wave === wave.id;
              return (
                <button
                  key={wave.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`focus-ring h-11 rounded-md border text-sm ${
                    on ? "border-accent bg-accent text-fg" : "border-border bg-surface text-muted"
                  }`}
                  onClick={() => update({ wave: wave.id })}
                >
                  {wave.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            <Knob
              label="Cut"
              value={patch.cutoff}
              display={formatHz(musical.cutoffHz)}
              onChange={(cutoff) => update({ cutoff })}
            />
            <Knob
              label="Res"
              value={patch.resonance}
              display={`Q ${musical.q.toFixed(1)}`}
              onChange={(resonance) => update({ resonance })}
            />
            <Knob
              label="Atk"
              value={patch.attack}
              display={formatTime(logMap(patch.attack, ATT_MIN, ATT_MAX))}
              onChange={(attack) => update({ attack })}
            />
            <Knob
              label="Dec"
              value={patch.decay}
              display={formatTime(logMap(patch.decay, DEC_MIN, DEC_MAX))}
              onChange={(decay) => update({ decay })}
            />
            <Knob
              label="Sus"
              value={patch.sustain}
              display={`${Math.round(patch.sustain * 100)}%`}
              onChange={(sustain) => update({ sustain })}
            />
            <Knob
              label="Rel"
              value={patch.release}
              display={formatTime(logMap(patch.release, REL_MIN, REL_MAX))}
              onChange={(release) => update({ release })}
            />
          </div>
        </div>

        <div className="px-4 pb-6">
          <div role="tablist" aria-label="Banks" className="mb-3 grid grid-cols-2 gap-2">
            <Tab id="atlanta" current={bank} onSelect={setBank} label="Atlanta 808" />
            <Tab id="memphis" current={bank} onSelect={setBank} label="Memphis horror" />
          </div>
          <p className="mb-4 text-xs text-muted">
            {bank === "atlanta"
              ? "Sine subs with a pitch-drop punch. Chords keep the 808 under a soft stack."
              : "Minor stabs, the tritone, and a chromatic church descent."}
          </p>
          <PadGroup title={bank === "atlanta" ? "Subs" : "Notes"} hits={notes} heldId={heldId} loopId={loopId} onPlay={play} onRelease={release} compact />
          <PadGroup title="Chords" hits={chords} heldId={heldId} loopId={loopId} onPlay={play} onRelease={release} />
          <PadGroup title="Loops" hits={loops} heldId={heldId} loopId={loopId} onPlay={play} onRelease={release} />
        </div>
      </div>

      <Keyboard octave={octave} active={active} onOctave={setOctave} onDown={down} onUp={up} onCut={cut} />
    </main>
  );
}

function Tab({
  id,
  current,
  onSelect,
  label,
}: {
  id: BankId;
  current: BankId;
  onSelect: (id: BankId) => void;
  label: string;
}) {
  const on = current === id;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      className={`focus-ring h-11 rounded-md border text-sm ${
        on ? "border-accent bg-accent text-fg" : "border-border bg-surface text-muted"
      }`}
      onClick={() => onSelect(id)}
    >
      {label}
    </button>
  );
}

function PadGroup({
  title,
  hits,
  heldId,
  loopId,
  onPlay,
  onRelease,
  compact = false,
}: {
  title: string;
  hits: Hit[];
  heldId: string | null;
  loopId: string | null;
  onPlay: (hit: Hit) => void;
  onRelease: (hit: Hit) => void;
  compact?: boolean;
}) {
  return (
    <section className="mb-4">
      <h2 className="mb-2 text-xs tracking-widest text-muted">{title}</h2>
      <div className={compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-4"}>
        {hits.map((hit) => {
          const on = heldId === hit.id || loopId === hit.id;
          return (
            <button
              key={hit.id}
              type="button"
              aria-pressed={on}
              aria-label={`${hit.symbol}. ${hit.detail}`}
              title={hit.detail}
              className={`focus-ring rounded-lg border px-2 py-2 text-left ${
                compact ? "min-h-16" : "min-h-20"
              } ${on ? "border-accent bg-accent text-fg" : "border-border bg-surface text-fg"}`}
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                onPlay(hit);
              }}
              onPointerUp={() => onRelease(hit)}
              onPointerCancel={() => onRelease(hit)}
            >
              <span className="flex items-center justify-between gap-1">
                <span className={`font-display leading-none ${compact ? "text-xl" : "text-2xl"}`}>{hit.symbol}</span>
                {hit.kind === "loop" ? <Repeat className="size-3.5 shrink-0" /> : null}
              </span>
              <span className={`mt-1 block truncate text-xs ${on ? "text-fg" : "text-muted"}`}>{hit.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function lcdTitle(shown: Hit | undefined, active: number[], armed: boolean): string {
  if (shown) return shown.symbol;
  if (active.length === 0) return armed ? "Open" : "Idle";
  const names = active.map(noteName);
  if (names.length > 4) return `${names.slice(0, 4).join(" ")}…`;
  return names.join("  ");
}
