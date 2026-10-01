import { TUNING_PRESETS } from '../audio/tunings.js';
import { frequencyToMidi } from '../audio/note-utils.js';

/**
 * Turns a parsed ABC tune into a playable "chart" for a stringed instrument:
 * - transposes by octaves into the instrument's range
 * - assigns string, semitone offset ("fret"), finger and hand position
 * - splits the song into phrases (Rocksmith-style sections)
 * - ranks notes so each phrase has dynamic-difficulty levels
 */

export const MAX_LEVEL = 5;
const LEVEL_FRACTIONS = [0.3, 0.45, 0.6, 0.75, 0.88, 1];
const MAX_OFFSET_TOP = 17;   // highest semitone offset allowed on the top string
const MAX_OFFSET_OTHER = 12; // on lower strings

// rel semitones above hand base → finger number
const REL_FINGER = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4 };
const BASE_POSITION = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10];

export function positionName(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function getOpenMidis(tuningKey) {
  const preset = TUNING_PRESETS[tuningKey];
  return preset.strings.map(s => frequencyToMidi(s.frequency));
}

/** Octave shift (multiple of 12) that best fits the melody on the instrument. */
function fitOctave(notes, openMidis) {
  if (notes.length === 0) return 0;
  const lo = Math.min(...notes.map(n => n.midi));
  const hi = Math.max(...notes.map(n => n.midi));
  const instLo = openMidis[0];
  const instHi = openMidis[openMidis.length - 1] + 12; // comfortable top
  let best = 0;
  let bestCost = Infinity;
  for (let shift = -36; shift <= 36; shift += 12) {
    const l = lo + shift;
    const h = hi + shift;
    let cost = 0;
    if (l < instLo) cost += (instLo - l) * 10;
    if (h > instHi) cost += (h - instHi);
    cost += Math.abs(shift) * 0.01;
    if (cost < bestCost) { bestCost = cost; best = shift; }
  }
  return best;
}

/** Choose a string + offset for every note via dynamic programming. */
function assignStrings(notes, openMidis) {
  const nStr = openMidis.length;
  const cands = notes.map(n => {
    const list = [];
    for (let s = 0; s < nStr; s++) {
      const off = n.midi - openMidis[s];
      const maxOff = s === nStr - 1 ? MAX_OFFSET_TOP : MAX_OFFSET_OTHER;
      if (off >= 0 && off <= maxOff) {
        let cost = off <= 6 ? 0 : off === 7 ? 1 : 4 + off;
        cost += off * 0.01;
        list.push({ s, off, cost });
      }
    }
    if (list.length === 0) {
      // Out of range: clamp to nearest playable spot (shown but may be unreachable)
      const s = n.midi < openMidis[0] ? 0 : nStr - 1;
      list.push({ s, off: Math.max(0, n.midi - openMidis[s]), cost: 50 });
    }
    return list;
  });

  // DP
  const dp = cands.map(l => l.map(() => ({ cost: Infinity, prev: -1 })));
  cands[0]?.forEach((c, j) => { dp[0][j].cost = c.cost; });
  for (let i = 1; i < cands.length; i++) {
    for (let j = 0; j < cands[i].length; j++) {
      const c = cands[i][j];
      for (let k = 0; k < cands[i - 1].length; k++) {
        const p = cands[i - 1][k];
        let trans = Math.abs(c.s - p.s) * 0.25;
        // staying high on a string after a shift is cheaper than jumping back
        if (p.off > 7 && c.off > 7) trans += Math.abs(c.off - p.off) * 0.1;
        else if (p.off > 7 !== c.off > 7 && c.off !== 0) trans += 0.5;
        const total = dp[i - 1][k].cost + c.cost + trans;
        if (total < dp[i][j].cost) dp[i][j] = { cost: total, prev: k };
      }
    }
  }
  // Backtrack
  const last = dp.length - 1;
  if (last < 0) return;
  let j = dp[last].reduce((bi, v, idx, arr) => (v.cost < arr[bi].cost ? idx : bi), 0);
  for (let i = last; i >= 0; i--) {
    const c = cands[i][j];
    notes[i].string = c.s;
    notes[i].offset = c.off;
    j = dp[i][j].prev;
  }
}

/** Assign hand position (base offset) and finger numbers with lookahead. */
function assignFingers(notes) {
  let base = 0;
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    const o = n.offset;
    if (o === 0) {
      n.finger = 0;
      n.base = base;
      n.position = BASE_POSITION[Math.min(base, BASE_POSITION.length - 1)];
      continue;
    }
    const rel = o - base;
    if (rel < 1 || rel > 8) {
      // Shift: pick the base that covers the most upcoming fingered notes
      let bestB = Math.max(0, o - 7);
      let bestScore = -1;
      for (let b = Math.max(0, o - 8); b <= o - 1; b++) {
        let score = 0;
        for (let k = i; k < Math.min(notes.length, i + 8); k++) {
          const ok = notes[k].offset;
          if (ok === 0) continue;
          const r = ok - b;
          if (r >= 1 && r <= 8) score++;
          else break;
        }
        // prefer standard positions and staying low
        score += [0, 2, 4, 5, 7, 9, 10, 12].includes(b) ? 0.3 : 0;
        score -= b * 0.01;
        if (score > bestScore) { bestScore = score; bestB = b; }
      }
      base = bestB;
    }
    n.base = base;
    n.finger = REL_FINGER[o - base] ?? 4;
    n.position = BASE_POSITION[Math.min(base, BASE_POSITION.length - 1)];
  }
}

function beatUnit(meter) {
  const compound = meter.num % 3 === 0 && meter.num > 3;
  return compound ? (4 / meter.den) * 3 : 4 / meter.den;
}

function near(a, b) { return Math.abs(a - b) < 1e-3; }
function isMultiple(x, unit) { const q = x / unit; return Math.abs(q - Math.round(q)) < 1e-3; }

/** Split sections into phrases of at most `maxBars` bars. */
function buildPhrases(parsed) {
  const phrases = [];
  for (const sec of parsed.sections) {
    const barCount = sec.barEnd - sec.barStart;
    const chunks = barCount > 8 ? Math.ceil(barCount / 4) : barCount > 4 ? 2 : 1;
    const per = Math.ceil(barCount / chunks);
    for (let c = 0; c < chunks; c++) {
      const b0 = sec.barStart + c * per;
      const b1 = Math.min(sec.barEnd, b0 + per);
      if (b0 >= b1) continue;
      const startBar = parsed.bars[b0];
      const endBar = parsed.bars[b1 - 1];
      phrases.push({
        name: chunks > 1 ? `${sec.name} · ${c + 1}` : sec.name,
        section: sec.name,
        start: startBar.start,
        end: endBar.start + endBar.dur,
        barStart: b0,
        barEnd: b1,
      });
    }
  }
  if (phrases.length === 0) {
    phrases.push({ name: 'A', section: 'A', start: 0, end: parsed.totalBeats, barStart: 0, barEnd: parsed.bars.length });
  }
  return phrases;
}

function rankLevels(notes, phrases, parsed) {
  for (let p = 0; p < phrases.length; p++) {
    const ph = phrases[p];
    const idxs = [];
    notes.forEach((n, i) => { if (n.phrase === p) idxs.push(i); });
    if (idxs.length === 0) continue;

    const scored = idxs.map((i, k) => {
      const n = notes[i];
      const bar = parsed.bars[n.bar] || { start: 0, meter: parsed.meter };
      const meter = bar.meter || parsed.meter;
      const beat = beatUnit(meter);
      const pos = n.start - bar.start;
      let w = 0;
      if (near(pos, 0)) w = 4;
      else if (isMultiple(pos, beat * 2)) w = 3;
      else if (isMultiple(pos, beat)) w = 2;
      else if (isMultiple(pos, beat / 2)) w = 1;
      if (n.dur >= beat - 1e-3) w += 1.5;
      if (k === 0) w += 10;
      w -= k * 0.0001; // stable tiebreak: earlier first
      return { i, w };
    });
    scored.sort((a, b) => b.w - a.w);
    scored.forEach((s, rank) => {
      let lvl = MAX_LEVEL;
      for (let L = 0; L <= MAX_LEVEL; L++) {
        if (rank < Math.ceil(idxs.length * LEVEL_FRACTIONS[L])) { lvl = L; break; }
      }
      notes[s.i].minLevel = lvl;
    });
    ph.noteCount = idxs.length;
  }
}

/**
 * Compute a difficulty score (1–10) for a chart.
 */
export function rateDifficulty(chart) {
  const notes = chart.notes;
  if (notes.length === 0) return { score: 1, label: 'Beginner' };
  const secs = chart.totalBeats * 60 / chart.tempo;
  const nps = notes.length / Math.max(1, secs);
  const maxPos = Math.max(...notes.map(n => n.position || 1));
  const range = Math.max(...notes.map(n => n.midi)) - Math.min(...notes.map(n => n.midi));
  const scalePcs = new Set([0, 2, 4, 5, 7, 9, 11].map(x => (x + chart.key.tonicPc) % 12));
  // modes shift the scale; count chromatic notes vs. the key signature instead
  const keyPcs = new Set();
  const LET = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  for (const [L, pc] of Object.entries(LET)) keyPcs.add((pc + (chart.key.accidentals[L] || 0) + 12) % 12);
  const chromatic = notes.filter(n => !keyPcs.has(n.midi % 12)).length / notes.length;
  const shifts = notes.reduce((acc, n, i) => acc + (i > 0 && n.offset !== 0 && notes[i - 1].offset !== 0 && n.base !== notes[i - 1].base ? 1 : 0), 0);
  const minDurSec = Math.min(...notes.map(n => n.dur)) * 60 / chart.tempo;
  void scalePcs;

  let score = 1
    + Math.min(4, nps * 0.75)
    + (maxPos - 1) * 0.7
    + chromatic * 5
    + Math.min(1.5, shifts / Math.max(1, notes.length) * 15)
    + (range > 19 ? 0.8 : range > 12 ? 0.4 : 0)
    + (minDurSec < 0.15 ? 1 : minDurSec < 0.25 ? 0.5 : 0)
    + (Object.keys(chart.key.accidentals).length >= 4 ? 0.5 : 0);
  score = Math.max(1, Math.min(10, score));
  const label = score <= 2.5 ? 'Beginner' : score <= 4.5 ? 'Easy' : score <= 6.5 ? 'Intermediate' : score <= 8 ? 'Advanced' : 'Expert';
  return { score: Math.round(score * 10) / 10, label };
}

/**
 * Build a playable chart.
 * @param {object} parsed - result of parseABC
 * @param {string} tuningKey
 */
export function buildChart(parsed, tuningKey) {
  const openMidis = getOpenMidis(tuningKey);
  const shift = fitOctave(parsed.notes, openMidis);
  const notes = parsed.notes.map(n => ({ ...n, midi: n.midi + shift }));

  assignStrings(notes, openMidis);
  assignFingers(notes);

  const phrases = buildPhrases(parsed);
  let p = 0;
  for (const n of notes) {
    while (p < phrases.length - 1 && n.start >= phrases[p].end - 1e-6) p++;
    n.phrase = p;
  }
  rankLevels(notes, phrases, parsed);

  const chart = {
    title: parsed.title,
    tempo: parsed.tempo,
    meter: parsed.meter,
    key: parsed.key,
    totalBeats: parsed.totalBeats,
    bars: parsed.bars,
    chords: parsed.chords.map(c => ({ ...c })),
    transpose: shift,
    tuningKey,
    openMidis,
    notes,
    phrases,
  };
  chart.difficulty = rateDifficulty(chart);
  chart.maxPosition = Math.max(1, ...notes.map(n => n.position || 1));
  chart.range = notes.length
    ? { lo: Math.min(...notes.map(n => n.midi)), hi: Math.max(...notes.map(n => n.midi)) }
    : { lo: 0, hi: 0 };
  return chart;
}
