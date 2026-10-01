import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Plus, i as Power, n as Square, o as Minus, r as Repeat } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BJB7kKMt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WAVES = [
	{
		id: "sine",
		label: "Sine"
	},
	{
		id: "triangle",
		label: "Tri"
	},
	{
		id: "sawtooth",
		label: "Saw"
	},
	{
		id: "square",
		label: "Sqr"
	},
	{
		id: "808",
		label: "808"
	},
	{
		id: "horror",
		label: "Horror"
	}
];
var COMPUTER_KEYS = [
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
	"'"
];
var ATT_MIN = .003;
var ATT_MAX = 1.5;
var DEC_MIN = .015;
var REL_MIN = .02;
var CUT_MAX = 14e3;
var WAVE_IDS = new Set(WAVES.map((w) => w.id));
function clamp01(v) {
	if (!Number.isFinite(v)) return 0;
	return Math.min(1, Math.max(0, v));
}
function logMap(v, min, max) {
	return min * Math.pow(max / min, clamp01(v));
}
function logUnmap(x, min, max) {
	return Math.log(Math.min(max, Math.max(min, x)) / min) / Math.log(max / min);
}
function toMusical(p) {
	return {
		wave: p.wave,
		volume: clamp01(p.volume),
		attack: logMap(p.attack, ATT_MIN, ATT_MAX),
		decay: logMap(p.decay, DEC_MIN, 2),
		sustain: clamp01(p.sustain),
		release: logMap(p.release, REL_MIN, 3),
		cutoffHz: logMap(p.cutoff, 70, CUT_MAX),
		q: .2 + clamp01(p.resonance) * 12
	};
}
function withTone(patch, tone) {
	return {
		...patch,
		wave: tone.wave,
		attack: logUnmap(tone.attack, ATT_MIN, ATT_MAX),
		decay: logUnmap(tone.decay, DEC_MIN, 2),
		sustain: tone.sustain,
		release: logUnmap(tone.release, REL_MIN, 3),
		cutoff: tone.cutoff,
		resonance: tone.resonance
	};
}
var DEFAULT_PATCH = {
	wave: "sawtooth",
	volume: .72,
	cutoff: logUnmap(2400, 70, CUT_MAX),
	resonance: .12,
	attack: logUnmap(.015, ATT_MIN, ATT_MAX),
	decay: logUnmap(.18, DEC_MIN, 2),
	sustain: .62,
	release: logUnmap(.22, REL_MIN, 3)
};
var NAMES = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B"
];
function noteName(midi) {
	const pc = (midi % 12 + 12) % 12;
	const oct = Math.floor(midi / 12) - 1;
	return `${NAMES[pc]}${oct}`;
}
function midiToHz(midi) {
	return 440 * Math.pow(2, (midi - 69) / 12);
}
function majorityOctave(midis) {
	const counts = /* @__PURE__ */ new Map();
	for (const m of midis) {
		const o = Math.floor(m / 12) - 1;
		counts.set(o, (counts.get(o) ?? 0) + 1);
	}
	let best = 3;
	let score = -1;
	for (const [o, c] of counts) if (c > score || c === score && o > best) {
		score = c;
		best = o;
	}
	return Math.min(5, Math.max(1, best));
}
function formatTime(seconds) {
	if (seconds < .1) return `${Math.round(seconds * 1e3)} ms`;
	return `${seconds.toFixed(2)} s`;
}
function formatHz(hz) {
	if (hz >= 1e3) {
		const k = hz / 1e3;
		return `${k >= 10 ? k.toFixed(0) : k.toFixed(1)} kHz`;
	}
	return `${Math.round(hz)} Hz`;
}
function keyCap(key) {
	if (key === " ") return "Sp";
	return key.length === 1 ? key.toUpperCase() : key;
}
function isPatch(value) {
	return typeof value === "object" && value !== null;
}
function sanitizePatch(value) {
	const raw = isPatch(value) ? value : {};
	const wave = WAVE_IDS.has(raw.wave) ? raw.wave : DEFAULT_PATCH.wave;
	const num = (n, fallback) => typeof n === "number" && Number.isFinite(n) ? clamp01(n) : fallback;
	return {
		wave,
		volume: num(raw.volume, DEFAULT_PATCH.volume),
		cutoff: num(raw.cutoff, DEFAULT_PATCH.cutoff),
		resonance: num(raw.resonance, DEFAULT_PATCH.resonance),
		attack: num(raw.attack, DEFAULT_PATCH.attack),
		decay: num(raw.decay, DEFAULT_PATCH.decay),
		sustain: num(raw.sustain, DEFAULT_PATCH.sustain),
		release: num(raw.release, DEFAULT_PATCH.release)
	};
}
var sub = {
	wave: "808",
	attack: .005,
	decay: .35,
	sustain: .82,
	release: 1.2,
	cutoff: .84,
	resonance: .04
};
var stack = {
	wave: "808",
	attack: .01,
	decay: .22,
	sustain: .52,
	release: .42,
	cutoff: .56,
	resonance: .16
};
var walk = {
	wave: "808",
	attack: .004,
	decay: .1,
	sustain: .4,
	release: .12,
	cutoff: .86,
	resonance: .04
};
var stab = {
	wave: "horror",
	attack: .004,
	decay: .11,
	sustain: .16,
	release: .16,
	cutoff: .36,
	resonance: .58
};
var drone = {
	wave: "horror",
	attack: .32,
	decay: .4,
	sustain: .74,
	release: 1.5,
	cutoff: .22,
	resonance: .7
};
var bell = {
	wave: "sine",
	attack: .003,
	decay: .32,
	sustain: 0,
	release: .22,
	cutoff: .92,
	resonance: .1
};
var organ = {
	wave: "square",
	attack: .08,
	decay: .2,
	sustain: .68,
	release: .75,
	cutoff: .2,
	resonance: .34
};
var HITS = [
	{
		id: "f1",
		bank: "atlanta",
		kind: "note",
		name: "808",
		symbol: "F1",
		detail: "F1 sub. Short pitch drop, then a long sine.",
		tone: sub,
		notes: [29]
	},
	{
		id: "g1",
		bank: "atlanta",
		kind: "note",
		name: "808",
		symbol: "G1",
		detail: "G1 sub. A common Atlanta root.",
		tone: sub,
		notes: [31]
	},
	{
		id: "ab1",
		bank: "atlanta",
		kind: "note",
		name: "808",
		symbol: "Ab1",
		detail: "Ab1 sub. Flat-side 808.",
		tone: sub,
		notes: [32]
	},
	{
		id: "bb1",
		bank: "atlanta",
		kind: "note",
		name: "808",
		symbol: "Bb1",
		detail: "Bb1 sub. Heavy and wide.",
		tone: sub,
		notes: [34]
	},
	{
		id: "c2",
		bank: "atlanta",
		kind: "note",
		name: "808",
		symbol: "C2",
		detail: "C2 sub. Center of the rack.",
		tone: sub,
		notes: [36]
	},
	{
		id: "d1",
		bank: "atlanta",
		kind: "note",
		name: "808",
		symbol: "D1",
		detail: "D1 sub. Sits under G minor.",
		tone: sub,
		notes: [26]
	},
	{
		id: "eb1",
		bank: "atlanta",
		kind: "note",
		name: "808",
		symbol: "Eb1",
		detail: "Eb1 sub. The flat third as a bass.",
		tone: sub,
		notes: [27]
	},
	{
		id: "a1",
		bank: "atlanta",
		kind: "note",
		name: "808",
		symbol: "A1",
		detail: "A1 sub. Open, minor-key root.",
		tone: sub,
		notes: [33]
	},
	{
		id: "fm",
		bank: "atlanta",
		kind: "chord",
		name: "Stack",
		symbol: "Fm",
		detail: "F minor over an F1 808. F1 · F3 · Ab3 · C4.",
		tone: stack,
		notes: [
			29,
			53,
			56,
			60
		]
	},
	{
		id: "cm",
		bank: "atlanta",
		kind: "chord",
		name: "Stack",
		symbol: "Cm",
		detail: "C minor over a C2 808. C2 · C3 · Eb3 · G3.",
		tone: stack,
		notes: [
			36,
			48,
			51,
			55
		]
	},
	{
		id: "gm",
		bank: "atlanta",
		kind: "chord",
		name: "Stack",
		symbol: "Gm",
		detail: "G minor over a G1 808. G1 · G3 · Bb3 · D4.",
		tone: stack,
		notes: [
			31,
			55,
			58,
			62
		]
	},
	{
		id: "am",
		bank: "atlanta",
		kind: "chord",
		name: "Stack",
		symbol: "Am",
		detail: "A minor over an A1 808. A1 · A3 · C4 · E4.",
		tone: stack,
		notes: [
			33,
			57,
			60,
			64
		]
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
		gate: .82,
		steps: [
			[
				36,
				48,
				51,
				55
			],
			[
				32,
				56,
				60,
				63
			],
			[
				39,
				51,
				55,
				58
			],
			[
				34,
				58,
				62,
				65
			]
		]
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
		gate: .82,
		steps: [
			[
				29,
				53,
				56,
				60
			],
			[
				25,
				49,
				53,
				56
			],
			[
				32,
				56,
				60,
				63
			],
			[
				27,
				51,
				55,
				58
			]
		]
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
		gate: .82,
		steps: [
			[
				31,
				55,
				58,
				62
			],
			[
				27,
				51,
				55,
				58
			],
			[
				34,
				58,
				62,
				65
			],
			[
				29,
				53,
				57,
				60
			]
		]
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
		gate: .7,
		steps: [
			[29],
			[32],
			[34],
			[36],
			[39],
			[36],
			[34],
			[32]
		]
	},
	{
		id: "drone",
		bank: "memphis",
		kind: "note",
		name: "Saw",
		symbol: "F#2",
		detail: "Low F# drone. Slow attack, dark filter.",
		tone: drone,
		notes: [42]
	},
	{
		id: "bell",
		bank: "memphis",
		kind: "note",
		name: "Sine",
		symbol: "C#5",
		detail: "High C# bell. Short decay, no sustain.",
		tone: bell,
		notes: [73]
	},
	{
		id: "doom",
		bank: "memphis",
		kind: "note",
		name: "Square",
		symbol: "C2",
		detail: "Low C, squared off and filtered.",
		tone: organ,
		notes: [36]
	},
	{
		id: "scream",
		bank: "memphis",
		kind: "note",
		name: "Sine",
		symbol: "A5",
		detail: "Thin A5. The music-box register.",
		tone: bell,
		notes: [81]
	},
	{
		id: "mystic",
		bank: "memphis",
		kind: "chord",
		name: "Triad",
		symbol: "C#m",
		detail: "C# minor. Closed stab. C#3 · E3 · G#3.",
		tone: stab,
		notes: [
			49,
			52,
			56
		]
	},
	{
		id: "six",
		bank: "memphis",
		kind: "chord",
		name: "Triad",
		symbol: "F#m",
		detail: "F# minor. The Memphis minor stab. F#3 · A3 · C#4.",
		tone: stab,
		notes: [
			54,
			57,
			61
		]
	},
	{
		id: "devil",
		bank: "memphis",
		kind: "chord",
		name: "Tritone",
		symbol: "C+F#",
		detail: "Tritone. C3 against F#3.",
		tone: stab,
		notes: [48, 54]
	},
	{
		id: "phrygian",
		bank: "memphis",
		kind: "chord",
		name: "Flat 2",
		symbol: "Dm(b2)",
		detail: "D minor with Eb on top. D3 · F3 · A3 · Eb4.",
		tone: stab,
		notes: [
			50,
			53,
			57,
			63
		]
	},
	{
		id: "dim7",
		bank: "memphis",
		kind: "chord",
		name: "Dim 7",
		symbol: "Cdim7",
		detail: "C diminished seventh. C · Eb · Gb · A.",
		tone: stab,
		notes: [
			48,
			51,
			54,
			57
		]
	},
	{
		id: "tomb",
		bank: "memphis",
		kind: "chord",
		name: "Closed",
		symbol: "Fm",
		detail: "F minor, mid register, no sub. F3 · Ab3 · C4.",
		tone: stab,
		notes: [
			53,
			56,
			60
		]
	},
	{
		id: "cluster",
		bank: "memphis",
		kind: "chord",
		name: "Minor 2nd",
		symbol: "C+Db",
		detail: "Cluster. C4 and Db4.",
		tone: stab,
		notes: [60, 61]
	},
	{
		id: "flat9",
		bank: "memphis",
		kind: "chord",
		name: "Add b9",
		symbol: "Cm(b9)",
		detail: "C minor, flat nine. C3 · Eb3 · G3 · Db4.",
		tone: stab,
		notes: [
			48,
			51,
			55,
			61
		]
	},
	{
		id: "fifth",
		bank: "memphis",
		kind: "chord",
		name: "Organ",
		symbol: "F#+C#",
		detail: "Open fifth. F#2 and C#3, square and dull.",
		tone: organ,
		notes: [42, 49]
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
		gate: .42,
		steps: [
			[
				59,
				62,
				66
			],
			[
				58,
				61,
				65
			],
			[
				57,
				60,
				64
			],
			[
				56,
				59,
				63
			]
		]
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
		gate: .46,
		steps: [
			[81],
			[79],
			[77],
			[76],
			[74],
			[76],
			[77],
			[79]
		]
	}
];
function hitsIn(bank, kind) {
	return HITS.filter((h) => h.bank === bank && h.kind === kind);
}
function hitById(id) {
	if (!id) return void 0;
	return HITS.find((h) => h.id === id);
}
var SILENT = /* @__PURE__ */ new Uint8Array(1024);
SILENT.fill(128);
function distortionCurve(amount) {
	const n = 256;
	const curve = new Float32Array(n);
	const norm = Math.tanh(amount);
	for (let i = 0; i < n; i++) {
		const x = i / 255 * 2 - 1;
		curve[i] = Math.tanh(x * amount) / norm;
	}
	return curve;
}
var SynthEngine = class {
	ctx = null;
	master = null;
	filter = null;
	analyser = null;
	timeBuf = null;
	noise = null;
	mild = null;
	heavy = null;
	musical = toMusical(DEFAULT_PATCH);
	voices = /* @__PURE__ */ new Map();
	owners = /* @__PURE__ */ new Map();
	born = /* @__PURE__ */ new Map();
	seq = 0;
	loopGen = 0;
	stepTimer = 0;
	gateTimer = 0;
	onNotes = () => {};
	get armed() {
		return this.ctx !== null;
	}
	arm() {
		if (typeof window === "undefined") return false;
		try {
			if (!this.ctx) {
				const Ctor = window.AudioContext ?? window.webkitAudioContext;
				if (!Ctor) return false;
				this.ctx = new Ctor();
				this.build();
				this.apply();
			}
			if (this.ctx.state !== "running") this.ctx.resume();
			return true;
		} catch {
			return false;
		}
	}
	setPatch(musical) {
		this.musical = musical;
		this.apply();
	}
	down(midi, owner, velocity = .9) {
		if (!this.arm() || !this.ctx) return;
		let owners = this.owners.get(midi);
		if (!owners) {
			owners = /* @__PURE__ */ new Set();
			this.owners.set(midi, owners);
		}
		if (owners.has(owner)) return;
		const fresh = owners.size === 0;
		owners.add(owner);
		if (fresh) {
			this.stealIfNeeded(midi);
			const voice = this.spawn(midi, this.ctx.currentTime, velocity);
			this.voices.set(midi, voice);
			this.born.set(midi, ++this.seq);
		}
		this.emit();
	}
	up(midi, owner) {
		const owners = this.owners.get(midi);
		if (!owners || !owners.has(owner)) return;
		owners.delete(owner);
		if (owners.size === 0) {
			this.voices.get(midi)?.release(this.ctx?.currentTime ?? 0);
			this.voices.delete(midi);
			this.owners.delete(midi);
			this.born.delete(midi);
		}
		this.emit();
	}
	releaseOwner(owner) {
		for (const [midi, set] of [...this.owners.entries()]) if (set.has(owner)) this.up(midi, owner);
	}
	releaseOwnerPrefix(prefix) {
		for (const [midi, set] of [...this.owners.entries()]) for (const owner of [...set]) if (owner.startsWith(prefix)) this.up(midi, owner);
	}
	releaseKeys() {
		this.releaseOwner("key");
	}
	startLoop(steps, stepMs, gate) {
		this.stopLoop();
		if (!this.arm() || !this.ctx) return;
		const gen = ++this.loopGen;
		let i = 0;
		const fire = () => {
			if (gen !== this.loopGen || !this.ctx) return;
			if (this.gateTimer) window.clearTimeout(this.gateTimer);
			this.releaseOwner("loop");
			const chord = steps[i % steps.length] ?? [];
			i += 1;
			for (const n of chord) this.down(n, "loop", .82);
			this.gateTimer = window.setTimeout(() => {
				if (gen !== this.loopGen) return;
				this.releaseOwner("loop");
			}, Math.max(40, stepMs * gate));
			this.stepTimer = window.setTimeout(fire, stepMs);
		};
		fire();
	}
	stopLoop() {
		this.loopGen += 1;
		if (this.stepTimer) window.clearTimeout(this.stepTimer);
		if (this.gateTimer) window.clearTimeout(this.gateTimer);
		this.stepTimer = 0;
		this.gateTimer = 0;
		this.releaseOwner("loop");
	}
	allOff() {
		this.stopLoop();
		const now = this.ctx?.currentTime ?? 0;
		for (const voice of this.voices.values()) voice.release(now);
		this.voices.clear();
		this.owners.clear();
		this.born.clear();
		this.emit();
	}
	readFrame() {
		if (!this.analyser || !this.timeBuf) return {
			time: SILENT,
			level: 0
		};
		this.analyser.getByteTimeDomainData(this.timeBuf);
		let sum = 0;
		for (let i = 0; i < this.timeBuf.length; i++) {
			const v = ((this.timeBuf[i] ?? 128) - 128) / 128;
			sum += v * v;
		}
		const level = Math.min(1, Math.sqrt(sum / this.timeBuf.length) * 3.4);
		return {
			time: this.timeBuf,
			level
		};
	}
	emit() {
		this.onNotes([...this.owners.keys()].sort((a, b) => a - b));
	}
	stealIfNeeded(midi) {
		if (this.voices.has(midi) || this.voices.size < 16 || !this.ctx) return;
		let oldestMidi = -1;
		let oldest = Infinity;
		for (const [m, born] of this.born) if (m !== midi && born < oldest) {
			oldest = born;
			oldestMidi = m;
		}
		if (oldestMidi < 0) return;
		this.voices.get(oldestMidi)?.release(this.ctx.currentTime);
		this.voices.delete(oldestMidi);
		this.owners.delete(oldestMidi);
		this.born.delete(oldestMidi);
	}
	build() {
		const ctx = this.ctx;
		if (!ctx) return;
		this.filter = ctx.createBiquadFilter();
		this.filter.type = "lowpass";
		const comp = ctx.createDynamicsCompressor();
		comp.threshold.value = -14;
		comp.knee.value = 8;
		comp.ratio.value = 3;
		comp.attack.value = .004;
		comp.release.value = .2;
		this.master = ctx.createGain();
		this.analyser = ctx.createAnalyser();
		this.analyser.fftSize = 2048;
		this.analyser.smoothingTimeConstant = .78;
		this.timeBuf = new Uint8Array(this.analyser.frequencyBinCount);
		this.filter.connect(comp);
		comp.connect(this.master);
		this.master.connect(this.analyser);
		this.analyser.connect(ctx.destination);
		const len = Math.floor(ctx.sampleRate * .25);
		this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
		const data = this.noise.getChannelData(0);
		for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
		this.mild = distortionCurve(1.5);
		this.heavy = distortionCurve(3.4);
	}
	apply() {
		if (!this.ctx || !this.filter || !this.master) return;
		const t = this.ctx.currentTime;
		const hz = Math.min(18e3, Math.max(40, this.musical.cutoffHz));
		this.filter.frequency.setTargetAtTime(hz, t, .02);
		this.filter.Q.setTargetAtTime(Math.max(.1, this.musical.q), t, .02);
		const vol = this.musical.volume <= 0 ? 0 : Math.pow(this.musical.volume, 1.4) * .9;
		this.master.gain.setTargetAtTime(vol, t, .015);
	}
	spawn(midi, time, velocity) {
		const ctx = this.ctx;
		const filter = this.filter;
		const wave = this.musical.wave;
		const freq = Math.max(20, midiToHz(midi));
		const attack = Math.max(.003, this.musical.attack);
		const decay = Math.max(.01, this.musical.decay);
		const sustain = this.musical.sustain;
		const releaseTime = Math.max(.02, this.musical.release);
		const env = ctx.createGain();
		const peak = this.peakFor(wave, midi, velocity);
		env.gain.setValueAtTime(0, time);
		env.gain.linearRampToValueAtTime(peak, time + attack);
		env.gain.linearRampToValueAtTime(peak * sustain, time + attack + decay);
		const oscs = [];
		const extras = [];
		const startOsc = (type, frequency, detune = 0) => {
			const osc = ctx.createOscillator();
			osc.type = type;
			osc.frequency.setValueAtTime(Math.max(20, frequency), time);
			osc.detune.setValueAtTime(detune, time);
			osc.start(time);
			oscs.push(osc);
			return osc;
		};
		if (wave === "808") {
			const bass = midi < 48;
			const osc = startOsc("sine", bass ? freq * 2.4 : freq);
			if (bass) osc.frequency.exponentialRampToValueAtTime(freq, time + .05);
			const harm = startOsc("sine", freq * 2);
			const harmGain = ctx.createGain();
			harmGain.gain.setValueAtTime(bass ? .1 : .04, time);
			const shaper = ctx.createWaveShaper();
			shaper.curve = this.mild;
			shaper.oversample = "2x";
			osc.connect(shaper);
			harm.connect(harmGain);
			harmGain.connect(shaper);
			shaper.connect(env);
			extras.push(harmGain, shaper);
			if (bass && this.noise) {
				const src = ctx.createBufferSource();
				src.buffer = this.noise;
				const hp = ctx.createBiquadFilter();
				hp.type = "highpass";
				hp.frequency.setValueAtTime(1400, time);
				const ng = ctx.createGain();
				ng.gain.setValueAtTime(.22, time);
				ng.gain.exponentialRampToValueAtTime(.001, time + .035);
				src.connect(hp);
				hp.connect(ng);
				ng.connect(env);
				src.start(time);
				src.stop(time + .06);
				extras.push(src, hp, ng);
			}
		} else if (wave === "horror") {
			const mix = ctx.createGain();
			mix.gain.setValueAtTime(.55, time);
			startOsc("sawtooth", freq, -14).connect(mix);
			startOsc("sawtooth", freq, 14).connect(mix);
			const high = startOsc("square", freq * 2);
			const highGain = ctx.createGain();
			highGain.gain.setValueAtTime(.14, time);
			high.connect(highGain);
			highGain.connect(mix);
			const shaper = ctx.createWaveShaper();
			shaper.curve = this.heavy;
			shaper.oversample = "2x";
			const trem = ctx.createGain();
			trem.gain.setValueAtTime(.86, time);
			const lfo = startOsc("sine", 5.2);
			const lfoDepth = ctx.createGain();
			lfoDepth.gain.setValueAtTime(.14, time);
			lfo.connect(lfoDepth);
			lfoDepth.connect(trem.gain);
			mix.connect(shaper);
			shaper.connect(env);
			env.connect(trem);
			trem.connect(filter);
			extras.push(mix, highGain, shaper, trem, lfoDepth);
		} else startOsc(wave, freq).connect(env);
		if (wave !== "horror") env.connect(filter);
		let stopped = false;
		const release = (when) => {
			if (stopped) return;
			stopped = true;
			const t = Math.max(when, ctx.currentTime);
			env.gain.cancelScheduledValues(t);
			env.gain.setValueAtTime(env.gain.value, t);
			env.gain.linearRampToValueAtTime(0, t + releaseTime);
			for (const osc of oscs) try {
				osc.stop(t + releaseTime + .03);
			} catch {}
		};
		const head = oscs[0];
		if (head) head.addEventListener("ended", () => {
			try {
				env.disconnect();
			} catch {}
			for (const node of extras) try {
				node.disconnect();
			} catch {}
		});
		return {
			env,
			oscs,
			extras,
			release
		};
	}
	peakFor(wave, midi, velocity) {
		const vel = Math.min(1, Math.max(.05, velocity));
		if (wave === "808") return vel * (midi < 48 ? .62 : .22);
		if (wave === "horror") return vel * .28;
		if (wave === "square") return vel * .22;
		return vel * .3;
	}
};
var globalKey = "__pit808";
function getEngine() {
	const g = globalThis;
	if (!g[globalKey]) g[globalKey] = new SynthEngine();
	return g[globalKey];
}
var MIN_OCT = 1;
var MAX_OCT = 5;
function pressOf(midi, active) {
	return active.includes(midi) ? "exact" : "off";
}
function Keyboard({ octave, active, onOctave, onDown, onUp, onCut }) {
	const [wide, setWide] = (0, import_react.useState)(false);
	const downRef = (0, import_react.useRef)(onDown);
	const upRef = (0, import_react.useRef)(onUp);
	const octaveRef = (0, import_react.useRef)(onOctave);
	const cutRef = (0, import_react.useRef)(onCut);
	downRef.current = onDown;
	upRef.current = onUp;
	octaveRef.current = onOctave;
	cutRef.current = onCut;
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(min-width: 768px)");
		const apply = () => setWide(mq.matches);
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, []);
	(0, import_react.useEffect)(() => {
		const held = /* @__PURE__ */ new Map();
		const limit = () => wide ? 18 : 12;
		const base = () => 12 * (octave + 1);
		const editable = (target) => {
			if (!(target instanceof HTMLElement)) return false;
			if (target.closest("[data-knob], input, textarea")) return true;
			return false;
		};
		const releaseAll = () => {
			for (const midi of held.values()) upRef.current(midi);
			held.clear();
		};
		const onKeyDown = (e) => {
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
			const idx = COMPUTER_KEYS.indexOf(key);
			if (idx < 0 || idx >= limit()) return;
			e.preventDefault();
			if (e.repeat || held.has(key)) return;
			const midi = base() + idx;
			held.set(key, midi);
			downRef.current(midi);
		};
		const onKeyUp = (e) => {
			const key = e.key.toLowerCase();
			const midi = held.get(key);
			if (midi === void 0) return;
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-border bg-surface pb-safe",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "focus-ring inline-flex size-11 items-center justify-center rounded-md border border-border bg-bg text-fg disabled:opacity-40",
							"aria-label": "Octave down",
							disabled: octave <= MIN_OCT,
							onClick: () => onOctave(octave - 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-12 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-display text-xl leading-none",
								children: ["C", octave]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted",
								children: range
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "focus-ring inline-flex size-11 items-center justify-center rounded-md border border-border bg-bg text-fg disabled:opacity-40",
							"aria-label": "Octave up",
							disabled: octave >= MAX_OCT,
							onClick: () => onOctave(octave + 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden text-xs text-muted sm:block",
					children: wide ? "A–J this octave, K through quote the next. Z/X shift." : "A–J play these keys. Z/X shift octave."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted sm:hidden",
					children: "Z/X octave"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-36 justify-center px-1 pb-2 md:h-44",
			children: whites.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `relative h-full min-w-0 flex-1 ${key.offset >= 12 ? "hidden max-w-24 md:block" : "max-w-24"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyButton, {
					midi: key.midi,
					label: noteName(key.midi),
					cap: key.offset < span ? keyCap(COMPUTER_KEYS[key.offset] ?? "") : "",
					kind: "white",
					press: pressOf(key.midi, active),
					onDown,
					onUp
				}), key.black ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyButton, {
					midi: key.black.midi,
					label: noteName(key.black.midi),
					cap: key.black.offset < span ? keyCap(COMPUTER_KEYS[key.black.offset] ?? "") : "",
					kind: "black",
					press: pressOf(key.black.midi, active),
					onDown,
					onUp
				}) : null]
			}, key.midi))
		})]
	});
}
function KeyButton({ midi, label, cap, kind, press, onDown, onUp }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-midi": midi,
		"aria-label": label,
		"aria-pressed": press !== "off",
		className: `key focus-ring ${kind === "white" ? "key-white h-full w-full" : "key-black"} ${press === "exact" ? "key-exact" : press === "cousin" ? "key-cousin" : ""}`,
		onContextMenu: (e) => e.preventDefault(),
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			onDown(midi);
		},
		onPointerUp: () => onUp(midi),
		onPointerCancel: () => onUp(midi),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center",
			children: [cap ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: cap
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: kind === "black" ? label.replace(/\d/, "") : label })]
		})
	});
}
function buildWhites(base) {
	const whites = [];
	for (let i = 0; i < 24; i++) {
		const semi = i % 12;
		if ([
			1,
			3,
			6,
			8,
			10
		].includes(semi)) continue;
		const hasBlack = [
			0,
			2,
			5,
			7,
			9
		].includes(semi) && i + 1 < 24;
		whites.push({
			midi: base + i,
			offset: i,
			black: hasBlack ? {
				midi: base + i + 1,
				offset: i + 1
			} : void 0
		});
	}
	return whites;
}
function Knob({ label, value, display, onChange }) {
	const drag = (0, import_react.useRef)(null);
	const angle = -135 + value * 270;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "knob focus-ring flex flex-col items-center gap-1",
		role: "slider",
		tabIndex: 0,
		"aria-label": label,
		"aria-valuemin": 0,
		"aria-valuemax": 100,
		"aria-valuenow": Math.round(value * 100),
		"aria-valuetext": display,
		"data-knob": "",
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			drag.current = {
				y: e.clientY,
				v: value,
				fine: e.shiftKey
			};
		},
		onPointerMove: (e) => {
			const d = drag.current;
			if (!d) return;
			const span = e.shiftKey || d.fine ? 420 : 140;
			onChange(Math.min(1, Math.max(0, d.v + (d.y - e.clientY) / span)));
		},
		onPointerUp: () => {
			drag.current = null;
		},
		onPointerCancel: () => {
			drag.current = null;
		},
		onKeyDown: (e) => {
			const step = e.shiftKey ? .01 : .03;
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
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative size-14 rounded-full border border-border bg-raised",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-1 rounded-full bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					style: { transform: `rotate(${angle}deg)` },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 rounded-full bg-accent" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs tracking-widest text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-fg",
				children: display
			})
		]
	});
}
function Scope({ armed }) {
	const canvasRef = (0, import_react.useRef)(null);
	const armedRef = (0, import_react.useRef)(armed);
	armedRef.current = armed;
	(0, import_react.useEffect)(() => {
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
			const meterW = Math.max(8, Math.floor(w * .035));
			const gap = Math.floor(w * .02);
			const plotW = w - meterW - gap;
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, w, h);
			ctx.strokeStyle = grid;
			ctx.lineWidth = Math.max(1, dpr);
			ctx.beginPath();
			for (let i = 1; i < 4; i++) {
				const y = h / 4 * i;
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
					const x = i / Math.max(1, time.length - 1) * plotW;
					const y = h / 2 - v * h * .46;
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
			levelSmooth = levelSmooth * .72 + level * .28;
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-xs tracking-widest text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Scope" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Level" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "h-24 w-full rounded-lg border border-border md:h-32"
		})]
	});
}
var STORAGE = "808-pit-rack";
function Rack() {
	const [patch, setPatch] = (0, import_react.useState)(DEFAULT_PATCH);
	const [octave, setOctave] = (0, import_react.useState)(3);
	const [bank, setBank] = (0, import_react.useState)("atlanta");
	const [armed, setArmed] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)([]);
	const [heldId, setHeldId] = (0, import_react.useState)(null);
	const [loopId, setLoopId] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const patchRef = (0, import_react.useRef)(patch);
	patchRef.current = patch;
	(0, import_react.useEffect)(() => {
		const eng = getEngine();
		eng.onNotes = (notes) => setActive(notes);
		return () => {
			eng.onNotes = () => {};
		};
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE);
			if (raw) {
				const data = JSON.parse(raw);
				const next = sanitizePatch(data.patch);
				patchRef.current = next;
				setPatch(next);
				if (typeof data.octave === "number" && data.octave >= 1 && data.octave <= 5) setOctave(data.octave);
				if (data.bank === "memphis" || data.bank === "atlanta") setBank(data.bank);
			}
		} catch {}
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		localStorage.setItem(STORAGE, JSON.stringify({
			patch,
			octave,
			bank
		}));
	}, [
		ready,
		patch,
		octave,
		bank
	]);
	function update(partial) {
		const next = {
			...patchRef.current,
			...partial
		};
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
	function down(midi) {
		if (!armNow()) return;
		getEngine().down(midi, "key");
	}
	function up(midi) {
		getEngine().up(midi, "key");
	}
	function play(hit) {
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
			getEngine().startLoop(hit.steps, hit.stepMs ?? 480, hit.gate ?? .8);
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
	function release(hit) {
		if (hit.kind === "loop") return;
		for (const n of hit.notes ?? []) getEngine().up(n, `pad:${hit.id}`);
		setHeldId((id) => id === hit.id ? null : id);
	}
	const shown = hitById(heldId) ?? hitById(loopId);
	const musical = toMusical(patch);
	const title = lcdTitle(shown, active, armed);
	const sub = shown ? shown.detail : active.length ? active.map(noteName).join(" · ") : armed ? "Play the keys, or hold a pad." : "Audio stays off until you touch power, a pad, or a key.";
	const notes = hitsIn(bank, "note");
	const chords = hitsIn(bank, "chord");
	const loops = hitsIn(bank, "loop");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 bg-accent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 border-b border-border px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl leading-none tracking-wide",
							children: "808 PIT"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 truncate text-xs tracking-widest text-muted",
							children: "Atlanta subs · Memphis stabs"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex w-24 shrink-0 flex-col gap-1 text-xs tracking-widest text-muted",
						children: ["Vol", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "fader",
							type: "range",
							min: 0,
							max: 1,
							step: .01,
							value: patch.volume,
							"aria-label": "Volume",
							onChange: (e) => update({ volume: Number(e.target.value) })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `focus-ring inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm ${armed ? "border border-border bg-surface text-fg" : "bg-accent text-fg"}`,
						onClick: power,
						children: [armed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "size-4" }), armed ? "Cut" : "Power"]
					})
				]
			}),
			!armed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-b border-border bg-surface px-4 py-2 text-xs text-muted",
				children: "Nothing sounds until a touch. Power, a pad, or any key arms the rack."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lcd min-w-0 rounded-lg px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-display text-4xl tracking-wide",
									children: title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `shrink-0 text-xs tracking-widest ${armed ? "text-accent" : "text-muted"}`,
									children: armed ? "Live" : "Off"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 truncate text-xs text-muted",
								children: sub
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scope, { armed })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 pb-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-xs tracking-widest text-muted",
								children: "Wave"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "radiogroup",
								"aria-label": "Waveform",
								className: "grid grid-cols-3 gap-2 sm:grid-cols-6",
								children: WAVES.map((wave) => {
									const on = patch.wave === wave.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										role: "radio",
										"aria-checked": on,
										className: `focus-ring h-11 rounded-md border text-sm ${on ? "border-accent bg-accent text-fg" : "border-border bg-surface text-muted"}`,
										onClick: () => update({ wave: wave.id }),
										children: wave.label
									}, wave.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
										label: "Cut",
										value: patch.cutoff,
										display: formatHz(musical.cutoffHz),
										onChange: (cutoff) => update({ cutoff })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
										label: "Res",
										value: patch.resonance,
										display: `Q ${musical.q.toFixed(1)}`,
										onChange: (resonance) => update({ resonance })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
										label: "Atk",
										value: patch.attack,
										display: formatTime(logMap(patch.attack, ATT_MIN, ATT_MAX)),
										onChange: (attack) => update({ attack })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
										label: "Dec",
										value: patch.decay,
										display: formatTime(logMap(patch.decay, DEC_MIN, 2)),
										onChange: (decay) => update({ decay })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
										label: "Sus",
										value: patch.sustain,
										display: `${Math.round(patch.sustain * 100)}%`,
										onChange: (sustain) => update({ sustain })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Knob, {
										label: "Rel",
										value: patch.release,
										display: formatTime(logMap(patch.release, REL_MIN, 3)),
										onChange: (release) => update({ release })
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 pb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								role: "tablist",
								"aria-label": "Banks",
								className: "mb-3 grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
									id: "atlanta",
									current: bank,
									onSelect: setBank,
									label: "Atlanta 808"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
									id: "memphis",
									current: bank,
									onSelect: setBank,
									label: "Memphis horror"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-xs text-muted",
								children: bank === "atlanta" ? "Sine subs with a pitch-drop punch. Chords keep the 808 under a soft stack." : "Minor stabs, the tritone, and a chromatic church descent."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadGroup, {
								title: bank === "atlanta" ? "Subs" : "Notes",
								hits: notes,
								heldId,
								loopId,
								onPlay: play,
								onRelease: release,
								compact: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadGroup, {
								title: "Chords",
								hits: chords,
								heldId,
								loopId,
								onPlay: play,
								onRelease: release
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadGroup, {
								title: "Loops",
								hits: loops,
								heldId,
								loopId,
								onPlay: play,
								onRelease: release
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {
				octave,
				active,
				onOctave: setOctave,
				onDown: down,
				onUp: up,
				onCut: cut
			})
		]
	});
}
function Tab({ id, current, onSelect, label }) {
	const on = current === id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "tab",
		"aria-selected": on,
		className: `focus-ring h-11 rounded-md border text-sm ${on ? "border-accent bg-accent text-fg" : "border-border bg-surface text-muted"}`,
		onClick: () => onSelect(id),
		children: label
	});
}
function PadGroup({ title, hits, heldId, loopId, onPlay, onRelease, compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-2 text-xs tracking-widest text-muted",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-4",
			children: hits.map((hit) => {
				const on = heldId === hit.id || loopId === hit.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": on,
					"aria-label": `${hit.symbol}. ${hit.detail}`,
					title: hit.detail,
					className: `focus-ring rounded-lg border px-2 py-2 text-left ${compact ? "min-h-16" : "min-h-20"} ${on ? "border-accent bg-accent text-fg" : "border-border bg-surface text-fg"}`,
					onPointerDown: (e) => {
						e.preventDefault();
						e.currentTarget.setPointerCapture(e.pointerId);
						onPlay(hit);
					},
					onPointerUp: () => onRelease(hit),
					onPointerCancel: () => onRelease(hit),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-between gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `font-display leading-none ${compact ? "text-xl" : "text-2xl"}`,
							children: hit.symbol
						}), hit.kind === "loop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-3.5 shrink-0" }) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `mt-1 block truncate text-xs ${on ? "text-fg" : "text-muted"}`,
						children: hit.name
					})]
				}, hit.id);
			})
		})]
	});
}
function lcdTitle(shown, active, armed) {
	if (shown) return shown.symbol;
	if (active.length === 0) return armed ? "Open" : "Idle";
	const names = active.map(noteName);
	if (names.length > 4) return `${names.slice(0, 4).join(" ")}…`;
	return names.join("  ");
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rack, {});
}
//#endregion
export { Home as component };
