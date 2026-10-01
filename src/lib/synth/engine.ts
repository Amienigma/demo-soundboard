import { midiToHz, toMusical, DEFAULT_PATCH, type Musical, type WaveId } from "./music";

type Voice = {
  env: GainNode;
  oscs: OscillatorNode[];
  extras: AudioNode[];
  release: (time: number) => void;
};

const SILENT = new Uint8Array(1024);
SILENT.fill(128);

function distortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(n);
  const norm = Math.tanh(amount);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * amount) / norm;
  }
  return curve;
}

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timeBuf: Uint8Array<ArrayBuffer> | null = null;
  private noise: AudioBuffer | null = null;
  private mild: Float32Array<ArrayBuffer> | null = null;
  private heavy: Float32Array<ArrayBuffer> | null = null;
  private musical: Musical = toMusical(DEFAULT_PATCH);
  private voices = new Map<number, Voice>();
  private owners = new Map<number, Set<string>>();
  private born = new Map<number, number>();
  private seq = 0;
  private loopGen = 0;
  private stepTimer = 0;
  private gateTimer = 0;
  onNotes: (notes: number[]) => void = () => {};

  get armed(): boolean {
    return this.ctx !== null;
  }

  arm(): boolean {
    if (typeof window === "undefined") return false;
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return false;
        this.ctx = new Ctor();
        this.build();
        this.apply();
      }
      if (this.ctx.state !== "running") void this.ctx.resume();
      return true;
    } catch {
      return false;
    }
  }

  setPatch(musical: Musical) {
    this.musical = musical;
    this.apply();
  }

  down(midi: number, owner: string, velocity = 0.9) {
    if (!this.arm() || !this.ctx) return;
    let owners = this.owners.get(midi);
    if (!owners) {
      owners = new Set();
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

  up(midi: number, owner: string) {
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

  releaseOwner(owner: string) {
    for (const [midi, set] of [...this.owners.entries()]) {
      if (set.has(owner)) this.up(midi, owner);
    }
  }

  releaseOwnerPrefix(prefix: string) {
    for (const [midi, set] of [...this.owners.entries()]) {
      for (const owner of [...set]) {
        if (owner.startsWith(prefix)) this.up(midi, owner);
      }
    }
  }

  releaseKeys() {
    this.releaseOwner("key");
  }

  startLoop(steps: number[][], stepMs: number, gate: number) {
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
      for (const n of chord) this.down(n, "loop", 0.82);
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

  readFrame(): { time: Uint8Array; level: number } {
    if (!this.analyser || !this.timeBuf) return { time: SILENT, level: 0 };
    this.analyser.getByteTimeDomainData(this.timeBuf);
    let sum = 0;
    for (let i = 0; i < this.timeBuf.length; i++) {
      const v = ((this.timeBuf[i] ?? 128) - 128) / 128;
      sum += v * v;
    }
    const level = Math.min(1, Math.sqrt(sum / this.timeBuf.length) * 3.4);
    return { time: this.timeBuf, level };
  }

  private emit() {
    this.onNotes([...this.owners.keys()].sort((a, b) => a - b));
  }

  private stealIfNeeded(midi: number) {
    if (this.voices.has(midi) || this.voices.size < 16 || !this.ctx) return;
    let oldestMidi = -1;
    let oldest = Infinity;
    for (const [m, born] of this.born) {
      if (m !== midi && born < oldest) {
        oldest = born;
        oldestMidi = m;
      }
    }
    if (oldestMidi < 0) return;
    this.voices.get(oldestMidi)?.release(this.ctx.currentTime);
    this.voices.delete(oldestMidi);
    this.owners.delete(oldestMidi);
    this.born.delete(oldestMidi);
  }

  private build() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 8;
    comp.ratio.value = 3;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    this.master = ctx.createGain();
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.78;
    this.timeBuf = new Uint8Array(this.analyser.frequencyBinCount);
    this.filter.connect(comp);
    comp.connect(this.master);
    this.master.connect(this.analyser);
    this.analyser.connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 0.25);
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.mild = distortionCurve(1.5);
    this.heavy = distortionCurve(3.4);
  }

  private apply() {
    if (!this.ctx || !this.filter || !this.master) return;
    const t = this.ctx.currentTime;
    const hz = Math.min(18000, Math.max(40, this.musical.cutoffHz));
    this.filter.frequency.setTargetAtTime(hz, t, 0.02);
    this.filter.Q.setTargetAtTime(Math.max(0.1, this.musical.q), t, 0.02);
    const vol = this.musical.volume <= 0 ? 0 : Math.pow(this.musical.volume, 1.4) * 0.9;
    this.master.gain.setTargetAtTime(vol, t, 0.015);
  }

  private spawn(midi: number, time: number, velocity: number): Voice {
    const ctx = this.ctx!;
    const filter = this.filter!;
    const wave = this.musical.wave;
    const freq = Math.max(20, midiToHz(midi));
    const attack = Math.max(0.003, this.musical.attack);
    const decay = Math.max(0.01, this.musical.decay);
    const sustain = this.musical.sustain;
    const releaseTime = Math.max(0.02, this.musical.release);
    const env = ctx.createGain();
    const peak = this.peakFor(wave, midi, velocity);
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(peak, time + attack);
    env.gain.linearRampToValueAtTime(peak * sustain, time + attack + decay);
    const oscs: OscillatorNode[] = [];
    const extras: AudioNode[] = [];

    const startOsc = (type: OscillatorType, frequency: number, detune = 0) => {
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
      if (bass) osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);
      const harm = startOsc("sine", freq * 2);
      const harmGain = ctx.createGain();
      harmGain.gain.setValueAtTime(bass ? 0.1 : 0.04, time);
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
        ng.gain.setValueAtTime(0.22, time);
        ng.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
        src.connect(hp);
        hp.connect(ng);
        ng.connect(env);
        src.start(time);
        src.stop(time + 0.06);
        extras.push(src, hp, ng);
      }
    } else if (wave === "horror") {
      const mix = ctx.createGain();
      mix.gain.setValueAtTime(0.55, time);
      startOsc("sawtooth", freq, -14).connect(mix);
      startOsc("sawtooth", freq, 14).connect(mix);
      const high = startOsc("square", freq * 2);
      const highGain = ctx.createGain();
      highGain.gain.setValueAtTime(0.14, time);
      high.connect(highGain);
      highGain.connect(mix);
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.heavy;
      shaper.oversample = "2x";
      const trem = ctx.createGain();
      trem.gain.setValueAtTime(0.86, time);
      const lfo = startOsc("sine", 5.2);
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.setValueAtTime(0.14, time);
      lfo.connect(lfoDepth);
      lfoDepth.connect(trem.gain);
      mix.connect(shaper);
      shaper.connect(env);
      env.connect(trem);
      trem.connect(filter);
      extras.push(mix, highGain, shaper, trem, lfoDepth);
    } else {
      startOsc(wave, freq).connect(env);
    }

    if (wave !== "horror") env.connect(filter);

    let stopped = false;
    const release = (when: number) => {
      if (stopped) return;
      stopped = true;
      const t = Math.max(when, ctx.currentTime);
      env.gain.cancelScheduledValues(t);
      env.gain.setValueAtTime(env.gain.value, t);
      env.gain.linearRampToValueAtTime(0, t + releaseTime);
      for (const osc of oscs) {
        try {
          osc.stop(t + releaseTime + 0.03);
        } catch {
          /* already stopped */
        }
      }
    };

    const head = oscs[0];
    if (head) {
      head.addEventListener("ended", () => {
        try {
          env.disconnect();
        } catch {
          /* already gone */
        }
        for (const node of extras) {
          try {
            node.disconnect();
          } catch {
            /* already gone */
          }
        }
      });
    }

    return { env, oscs, extras, release };
  }

  private peakFor(wave: WaveId, midi: number, velocity: number): number {
    const vel = Math.min(1, Math.max(0.05, velocity));
    if (wave === "808") return vel * (midi < 48 ? 0.62 : 0.22);
    if (wave === "horror") return vel * 0.28;
    if (wave === "square") return vel * 0.22;
    return vel * 0.3;
  }
}

const globalKey = "__pit808";

export function getEngine(): SynthEngine {
  const g = globalThis as typeof globalThis & { [globalKey]?: SynthEngine };
  if (!g[globalKey]) g[globalKey] = new SynthEngine();
  return g[globalKey];
}
