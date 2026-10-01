import { midiToFrequency } from './note-utils.js';

/**
 * Lightweight synth for Song Play: guide melody, backing chords + bass,
 * and a metronome click. Routed straight to the context destination
 * (not the input mix bus), so it never feeds the pitch detector directly.
 */

const CHORD_QUALITIES = [
  [/^(maj7|M7)/, [0, 4, 7, 11]],
  [/^(m7|min7|-7)/, [0, 3, 7, 10]],
  [/^(dim|°)/, [0, 3, 6]],
  [/^(aug|\+)/, [0, 4, 8]],
  [/^(sus4|sus)/, [0, 5, 7]],
  [/^sus2/, [0, 2, 7]],
  [/^(m|min|-)/, [0, 3, 7]],
  [/^7/, [0, 4, 7, 10]],
  [/^6/, [0, 4, 7, 9]],
  [/^/, [0, 4, 7]],
];
const ROOT_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function parseChordSymbol(sym) {
  const m = (sym || '').match(/^([A-G])([#b]?)(.*)$/);
  if (!m) return null;
  const root = (ROOT_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  const rest = m[3];
  for (const [re, intervals] of CHORD_QUALITIES) {
    if (re.test(rest)) return { root, intervals };
  }
  return { root, intervals: [0, 4, 7] };
}

export class SongSynth {
  constructor(ctx) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(ctx.destination);

    this.guideBus = ctx.createGain();
    this.backingBus = ctx.createGain();
    this.clickBus = ctx.createGain();
    for (const b of [this.guideBus, this.backingBus, this.clickBus]) b.connect(this.master);

    this._active = new Set();
  }

  setVolumes({ guide, backing, click }) {
    const t = this.ctx.currentTime;
    if (guide != null) this.guideBus.gain.setTargetAtTime(guide, t, 0.02);
    if (backing != null) this.backingBus.gain.setTargetAtTime(backing, t, 0.02);
    if (click != null) this.clickBus.gain.setTargetAtTime(click, t, 0.02);
  }

  _track(node, stopAt) {
    this._active.add(node);
    node.onended = () => this._active.delete(node);
    node.stop(stopAt);
  }

  /** Bowed-string-ish guide tone. */
  note(midi, time, dur, velocity = 0.25) {
    const ctx = this.ctx;
    const f = midiToFrequency(midi);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f;

    // gentle delayed vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 5.5;
    lfoGain.gain.setValueAtTime(0, time);
    lfoGain.gain.linearRampToValueAtTime(f * 0.006, time + Math.min(0.35, dur));
    lfo.connect(lfoGain).connect(osc.frequency);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(5000, f * 5);
    filter.Q.value = 0.8;

    const env = ctx.createGain();
    const len = Math.max(0.06, dur * 0.95);
    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(velocity, time + 0.04);
    env.gain.setTargetAtTime(velocity * 0.75, time + 0.05, 0.1);
    env.gain.setTargetAtTime(0.0001, time + len, 0.04);

    osc.connect(filter).connect(env).connect(this.guideBus);
    osc.start(time);
    lfo.start(time);
    this._track(osc, time + len + 0.3);
    this._track(lfo, time + len + 0.3);
  }

  /** Soft pad chord + plucked bass root. */
  chord(symbol, time, dur) {
    const c = parseChordSymbol(symbol);
    if (!c) return;
    const ctx = this.ctx;
    const len = Math.max(0.2, dur);

    // Pad (triangle voices around C4)
    for (const iv of c.intervals) {
      const midi = 55 + ((c.root + iv - 7 + 12) % 12) + 0; // G3..F#4 voicing
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = midiToFrequency(midi);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(0.07, time + 0.08);
      g.gain.setTargetAtTime(0.0001, time + len - 0.05, 0.08);
      osc.connect(g).connect(this.backingBus);
      osc.start(time);
      this._track(osc, time + len + 0.4);
    }

    // Bass
    const bass = ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.value = midiToFrequency(36 + c.root);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, time);
    bg.gain.linearRampToValueAtTime(0.35, time + 0.01);
    bg.gain.setTargetAtTime(0.0001, time + 0.05, Math.min(0.5, len / 2));
    bass.connect(bg).connect(this.backingBus);
    bass.start(time);
    this._track(bass, time + len + 0.4);
  }

  /** Sustained drone on the tonic (for tunes without chord symbols). */
  drone(pc, time, dur) {
    const ctx = this.ctx;
    for (const midi of [43 + ((pc - 7 + 12) % 12), 50 + ((pc - 2 + 12) % 12)]) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = midiToFrequency(midi);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(0.06, time + 0.3);
      g.gain.setTargetAtTime(0.0001, time + dur, 0.2);
      osc.connect(g).connect(this.backingBus);
      osc.start(time);
      this._track(osc, time + dur + 1);
    }
  }

  /** @param {number|null} forceVolume - play even when the click bus is muted (count-in) */
  click(time, accent = false, forceVolume = null) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = accent ? 1600 : 1100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(accent ? 0.35 : 0.2, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    if (forceVolume != null) {
      const v = ctx.createGain();
      v.gain.value = forceVolume;
      osc.connect(g).connect(v).connect(this.master);
    } else {
      osc.connect(g).connect(this.clickBus);
    }
    osc.start(time);
    this._track(osc, time + 0.05);
  }

  /** Stop everything that's been scheduled. */
  stopAll() {
    for (const n of this._active) {
      try { n.stop(); } catch { /* already stopped */ }
    }
    this._active.clear();
  }

  dispose() {
    this.stopAll();
    this.master.disconnect();
  }
}
