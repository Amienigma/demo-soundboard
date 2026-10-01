export type WaveId = "sine" | "triangle" | "sawtooth" | "square" | "808" | "horror";

export type BankId = "atlanta" | "memphis";

export type Patch = {
  wave: WaveId;
  volume: number;
  cutoff: number;
  resonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export type Musical = {
  wave: WaveId;
  volume: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  cutoffHz: number;
  q: number;
};

export type Tone = {
  wave: WaveId;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  cutoff: number;
  resonance: number;
};

export type HitKind = "note" | "chord" | "loop";

export type Hit = {
  id: string;
  bank: BankId;
  kind: HitKind;
  name: string;
  symbol: string;
  detail: string;
  tone: Tone;
  notes?: number[];
  steps?: number[][];
  stepMs?: number;
  gate?: number;
};

export const WAVES: { id: WaveId; label: string }[] = [
  { id: "sine", label: "Sine" },
  { id: "triangle", label: "Tri" },
  { id: "sawtooth", label: "Saw" },
  { id: "square", label: "Sqr" },
  { id: "808", label: "808" },
  { id: "horror", label: "Horror" },
];

export const COMPUTER_KEYS = [
  "a",
  "w",
  "s",
  "e",
  "d",
  "f",
  "t",
  "g",
  "y",
  "h",
  "u",
  "j",
  "k",
  "o",
  "l",
  "p",
  ";",
  "'",
] as const;

export const ATT_MIN = 0.003;
export const ATT_MAX = 1.5;
export const DEC_MIN = 0.015;
export const DEC_MAX = 2;
export const REL_MIN = 0.02;
export const REL_MAX = 3;
export const CUT_MIN = 70;
export const CUT_MAX = 14000;

const WAVE_IDS = new Set<WaveId>(WAVES.map((w) => w.id));

export function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

export function logMap(v: number, min: number, max: number): number {
  return min * Math.pow(max / min, clamp01(v));
}

export function logUnmap(x: number, min: number, max: number): number {
  const c = Math.min(max, Math.max(min, x));
  return Math.log(c / min) / Math.log(max / min);
}

export function toMusical(p: Patch): Musical {
  return {
    wave: p.wave,
    volume: clamp01(p.volume),
    attack: logMap(p.attack, ATT_MIN, ATT_MAX),
    decay: logMap(p.decay, DEC_MIN, DEC_MAX),
    sustain: clamp01(p.sustain),
    release: logMap(p.release, REL_MIN, REL_MAX),
    cutoffHz: logMap(p.cutoff, CUT_MIN, CUT_MAX),
    q: 0.2 + clamp01(p.resonance) * 12,
  };
}

export function withTone(patch: Patch, tone: Tone): Patch {
  return {
    ...patch,
    wave: tone.wave,
    attack: logUnmap(tone.attack, ATT_MIN, ATT_MAX),
    decay: logUnmap(tone.decay, DEC_MIN, DEC_MAX),
    sustain: tone.sustain,
    release: logUnmap(tone.release, REL_MIN, REL_MAX),
    cutoff: tone.cutoff,
    resonance: tone.resonance,
  };
}

export const DEFAULT_PATCH: Patch = {
  wave: "sawtooth",
  volume: 0.72,
  cutoff: logUnmap(2400, CUT_MIN, CUT_MAX),
  resonance: 0.12,
  attack: logUnmap(0.015, ATT_MIN, ATT_MAX),
  decay: logUnmap(0.18, DEC_MIN, DEC_MAX),
  sustain: 0.62,
  release: logUnmap(0.22, REL_MIN, REL_MAX),
};

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export function noteName(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${NAMES[pc]}${oct}`;
}

export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function majorityOctave(midis: number[]): number {
  const counts = new Map<number, number>();
  for (const m of midis) {
    const o = Math.floor(m / 12) - 1;
    counts.set(o, (counts.get(o) ?? 0) + 1);
  }
  let best = 3;
  let score = -1;
  for (const [o, c] of counts) {
    if (c > score || (c === score && o > best)) {
      score = c;
      best = o;
    }
  }
  return Math.min(5, Math.max(1, best));
}

export function formatTime(seconds: number): string {
  if (seconds < 0.1) return `${Math.round(seconds * 1000)} ms`;
  return `${seconds.toFixed(2)} s`;
}

export function formatHz(hz: number): string {
  if (hz >= 1000) {
    const k = hz / 1000;
    return `${k >= 10 ? k.toFixed(0) : k.toFixed(1)} kHz`;
  }
  return `${Math.round(hz)} Hz`;
}

export function keyCap(key: string): string {
  if (key === " ") return "Sp";
  return key.length === 1 ? key.toUpperCase() : key;
}

export function isPatch(value: unknown): value is Partial<Patch> {
  return typeof value === "object" && value !== null;
}

export function sanitizePatch(value: unknown): Patch {
  const raw = isPatch(value) ? value : {};
  const wave = WAVE_IDS.has(raw.wave as WaveId) ? (raw.wave as WaveId) : DEFAULT_PATCH.wave;
  const num = (n: unknown, fallback: number) =>
    typeof n === "number" && Number.isFinite(n) ? clamp01(n) : fallback;
  return {
    wave,
    volume: num(raw.volume, DEFAULT_PATCH.volume),
    cutoff: num(raw.cutoff, DEFAULT_PATCH.cutoff),
    resonance: num(raw.resonance, DEFAULT_PATCH.resonance),
    attack: num(raw.attack, DEFAULT_PATCH.attack),
    decay: num(raw.decay, DEFAULT_PATCH.decay),
    sustain: num(raw.sustain, DEFAULT_PATCH.sustain),
    release: num(raw.release, DEFAULT_PATCH.release),
  };
}

const sub: Tone = {
  wave: "808",
  attack: 0.005,
  decay: 0.35,
  sustain: 0.82,
  release: 1.2,
  cutoff: 0.84,
  resonance: 0.04,
};

const stack: Tone = {
  wave: "808",
  attack: 0.01,
  decay: 0.22,
  sustain: 0.52,
  release: 0.42,
  cutoff: 0.56,
  resonance: 0.16,
};

const walk: Tone = {
  wave: "808",
  attack: 0.004,
  decay: 0.1,
  sustain: 0.4,
  release: 0.12,
  cutoff: 0.86,
  resonance: 0.04,
};

const stab: Tone = {
  wave: "horror",
  attack: 0.004,
  decay: 0.11,
  sustain: 0.16,
  release: 0.16,
  cutoff: 0.36,
  resonance: 0.58,
};

const drone: Tone = {
  wave: "horror",
  attack: 0.32,
  decay: 0.4,
  sustain: 0.74,
  release: 1.5,
  cutoff: 0.22,
  resonance: 0.7,
};

const bell: Tone = {
  wave: "sine",
  attack: 0.003,
  decay: 0.32,
  sustain: 0,
  release: 0.22,
  cutoff: 0.92,
  resonance: 0.1,
};

const organ: Tone = {
  wave: "square",
  attack: 0.08,
  decay: 0.2,
  sustain: 0.68,
  release: 0.75,
  cutoff: 0.2,
  resonance: 0.34,
};

export const HITS: Hit[] = [
  {
    id: "f1",
    bank: "atlanta",
    kind: "note",
    name: "808",
    symbol: "F1",
    detail: "F1 sub. Short pitch drop, then a long sine.",
    tone: sub,
    notes: [29],
  },
  {
    id: "g1",
    bank: "atlanta",
    kind: "note",
    name: "808",
    symbol: "G1",
    detail: "G1 sub. A common Atlanta root.",
    tone: sub,
    notes: [31],
  },
  {
    id: "ab1",
    bank: "atlanta",
    kind: "note",
    name: "808",
    symbol: "Ab1",
    detail: "Ab1 sub. Flat-side 808.",
    tone: sub,
    notes: [32],
  },
  {
    id: "bb1",
    bank: "atlanta",
    kind: "note",
    name: "808",
    symbol: "Bb1",
    detail: "Bb1 sub. Heavy and wide.",
    tone: sub,
    notes: [34],
  },
  {
    id: "c2",
    bank: "atlanta",
    kind: "note",
    name: "808",
    symbol: "C2",
    detail: "C2 sub. Center of the rack.",
    tone: sub,
    notes: [36],
  },
  {
    id: "d1",
    bank: "atlanta",
    kind: "note",
    name: "808",
    symbol: "D1",
    detail: "D1 sub. Sits under G minor.",
    tone: sub,
    notes: [26],
  },
  {
    id: "eb1",
    bank: "atlanta",
    kind: "note",
    name: "808",
    symbol: "Eb1",
    detail: "Eb1 sub. The flat third as a bass.",
    tone: sub,
    notes: [27],
  },
  {
    id: "a1",
    bank: "atlanta",
    kind: "note",
    name: "808",
    symbol: "A1",
    detail: "A1 sub. Open, minor-key root.",
    tone: sub,
    notes: [33],
  },
  {
    id: "fm",
    bank: "atlanta",
    kind: "chord",
    name: "Stack",
    symbol: "Fm",
    detail: "F minor over an F1 808. F1 · F3 · Ab3 · C4.",
    tone: stack,
    notes: [29, 53, 56, 60],
  },
  {
    id: "cm",
    bank: "atlanta",
    kind: "chord",
    name: "Stack",
    symbol: "Cm",
    detail: "C minor over a C2 808. C2 · C3 · Eb3 · G3.",
    tone: stack,
    notes: [36, 48, 51, 55],
  },
  {
    id: "gm",
    bank: "atlanta",
    kind: "chord",
    name: "Stack",
    symbol: "Gm",
    detail: "G minor over a G1 808. G1 · G3 · Bb3 · D4.",
    tone: stack,
    notes: [31, 55, 58, 62],
  },
  {
    id: "am",
    bank: "atlanta",
    kind: "chord",
    name: "Stack",
    symbol: "Am",
    detail: "A minor over an A1 808. A1 · A3 · C4 · E4.",
    tone: stack,
    notes: [33, 57, 60, 64],
  },
  {
    id: "cycle",
    bank: "atlanta",
    kind: "loop",
    name: "Cm · Ab · Eb · Bb",
    symbol: "Cycle",
    detail: "i–VI–III–VII in C minor. The Atlanta four-chord loop.",
    tone: stack,
    stepMs: 860,
    gate: 0.82,
    steps: [
      [36, 48, 51, 55],
      [32, 56, 60, 63],
      [39, 51, 55, 58],
      [34, 58, 62, 65],
    ],
  },
  {
    id: "zone",
    bank: "atlanta",
    kind: "loop",
    name: "Fm · Db · Ab · Eb",
    symbol: "Zone",
    detail: "Same cycle, parked in F minor.",
    tone: stack,
    stepMs: 860,
    gate: 0.82,
    steps: [
      [29, 53, 56, 60],
      [25, 49, 53, 56],
      [32, 56, 60, 63],
      [27, 51, 55, 58],
    ],
  },
  {
    id: "east",
    bank: "atlanta",
    kind: "loop",
    name: "Gm · Eb · Bb · F",
    symbol: "East",
    detail: "i–bVI–bIII–bVII in G minor.",
    tone: stack,
    stepMs: 860,
    gate: 0.82,
    steps: [
      [31, 55, 58, 62],
      [27, 51, 55, 58],
      [34, 58, 62, 65],
      [29, 53, 57, 60],
    ],
  },
  {
    id: "slide",
    bank: "atlanta",
    kind: "loop",
    name: "F minor pentatonic",
    symbol: "Slide",
    detail: "F1 Ab1 Bb1 C2 Eb2. A sub walk, no chords.",
    tone: walk,
    stepMs: 300,
    gate: 0.7,
    steps: [[29], [32], [34], [36], [39], [36], [34], [32]],
  },
  {
    id: "drone",
    bank: "memphis",
    kind: "note",
    name: "Saw",
    symbol: "F#2",
    detail: "Low F# drone. Slow attack, dark filter.",
    tone: drone,
    notes: [42],
  },
  {
    id: "bell",
    bank: "memphis",
    kind: "note",
    name: "Sine",
    symbol: "C#5",
    detail: "High C# bell. Short decay, no sustain.",
    tone: bell,
    notes: [73],
  },
  {
    id: "doom",
    bank: "memphis",
    kind: "note",
    name: "Square",
    symbol: "C2",
    detail: "Low C, squared off and filtered.",
    tone: organ,
    notes: [36],
  },
  {
    id: "scream",
    bank: "memphis",
    kind: "note",
    name: "Sine",
    symbol: "A5",
    detail: "Thin A5. The music-box register.",
    tone: bell,
    notes: [81],
  },
  {
    id: "mystic",
    bank: "memphis",
    kind: "chord",
    name: "Triad",
    symbol: "C#m",
    detail: "C# minor. Closed stab. C#3 · E3 · G#3.",
    tone: stab,
    notes: [49, 52, 56],
  },
  {
    id: "six",
    bank: "memphis",
    kind: "chord",
    name: "Triad",
    symbol: "F#m",
    detail: "F# minor. The Memphis minor stab. F#3 · A3 · C#4.",
    tone: stab,
    notes: [54, 57, 61],
  },
  {
    id: "devil",
    bank: "memphis",
    kind: "chord",
    name: "Tritone",
    symbol: "C+F#",
    detail: "Tritone. C3 against F#3.",
    tone: stab,
    notes: [48, 54],
  },
  {
    id: "phrygian",
    bank: "memphis",
    kind: "chord",
    name: "Flat 2",
    symbol: "Dm(b2)",
    detail: "D minor with Eb on top. D3 · F3 · A3 · Eb4.",
    tone: stab,
    notes: [50, 53, 57, 63],
  },
  {
    id: "dim7",
    bank: "memphis",
    kind: "chord",
    name: "Dim 7",
    symbol: "Cdim7",
    detail: "C diminished seventh. C · Eb · Gb · A.",
    tone: stab,
    notes: [48, 51, 54, 57],
  },
  {
    id: "tomb",
    bank: "memphis",
    kind: "chord",
    name: "Closed",
    symbol: "Fm",
    detail: "F minor, mid register, no sub. F3 · Ab3 · C4.",
    tone: stab,
    notes: [53, 56, 60],
  },
  {
    id: "cluster",
    bank: "memphis",
    kind: "chord",
    name: "Minor 2nd",
    symbol: "C+Db",
    detail: "Cluster. C4 and Db4.",
    tone: stab,
    notes: [60, 61],
  },
  {
    id: "flat9",
    bank: "memphis",
    kind: "chord",
    name: "Add b9",
    symbol: "Cm(b9)",
    detail: "C minor, flat nine. C3 · Eb3 · G3 · Db4.",
    tone: stab,
    notes: [48, 51, 55, 61],
  },
  {
    id: "fifth",
    bank: "memphis",
    kind: "chord",
    name: "Organ",
    symbol: "F#+C#",
    detail: "Open fifth. F#2 and C#3, square and dull.",
    tone: organ,
    notes: [42, 49],
  },
  {
    id: "descent",
    bank: "memphis",
    kind: "loop",
    name: "Bm · Bbm · Am · Abm",
    symbol: "Descent",
    detail: "Chromatic minor drop. Staccato church stabs.",
    tone: stab,
    stepMs: 420,
    gate: 0.42,
    steps: [
      [59, 62, 66],
      [58, 61, 65],
      [57, 60, 64],
      [56, 59, 63],
    ],
  },
  {
    id: "box",
    bank: "memphis",
    kind: "loop",
    name: "A G F E D",
    symbol: "Box",
    detail: "High A minor fragment. Sine, short, uneasy.",
    tone: bell,
    stepMs: 280,
    gate: 0.46,
    steps: [[81], [79], [77], [76], [74], [76], [77], [79]],
  },
];

export function hitsIn(bank: BankId, kind: HitKind): Hit[] {
  return HITS.filter((h) => h.bank === bank && h.kind === kind);
}

export function hitById(id: string | null): Hit | undefined {
  if (!id) return undefined;
  return HITS.find((h) => h.id === id);
}
