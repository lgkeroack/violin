/**
 * Standard MIDI File import → melody "parsed" object compatible with buildChart().
 * Lets players bring their own songs (any genre) as .mid files.
 */

function readVarLen(view, pos) {
  let value = 0;
  let b;
  do {
    b = view.getUint8(pos.i++);
    value = (value << 7) | (b & 0x7f);
  } while (b & 0x80);
  return value;
}

function readStr(view, start, len) {
  let s = '';
  for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint8(start + i));
  return s;
}

/**
 * Parse an SMF into tracks of notes (in ticks) + meta.
 * @param {ArrayBuffer} buf
 */
export function parseMidi(buf) {
  const view = new DataView(buf);
  if (readStr(view, 0, 4) !== 'MThd') throw new Error('Not a MIDI file');
  const headerLen = view.getUint32(4);
  const ntracks = view.getUint16(10);
  const division = view.getUint16(12);
  if (division & 0x8000) throw new Error('SMPTE-timed MIDI files are not supported');

  let p = 8 + headerLen;
  const tracks = [];
  const meta = { tempo: null, timeSig: null, keySig: null, title: '' };

  for (let t = 0; t < ntracks && p < view.byteLength; t++) {
    const id = readStr(view, p, 4);
    const len = view.getUint32(p + 4);
    const start = p + 8;
    const end = start + len;
    p = end;
    if (id !== 'MTrk') continue;

    const pos = { i: start };
    let tick = 0;
    let status = 0;
    const open = new Map(); // key: ch*128+note → {start, vel}
    const notes = [];
    let name = '';
    let program = null;
    const channels = new Set();

    while (pos.i < end) {
      tick += readVarLen(view, pos);
      let b = view.getUint8(pos.i);
      if (b & 0x80) { status = b; pos.i++; } else if (!status) break;
      const type = status & 0xf0;
      const ch = status & 0x0f;

      if (status === 0xff) {
        const mt = view.getUint8(pos.i++);
        const ml = readVarLen(view, pos);
        if (mt === 0x51 && meta.tempo == null) {
          const us = (view.getUint8(pos.i) << 16) | (view.getUint8(pos.i + 1) << 8) | view.getUint8(pos.i + 2);
          meta.tempo = 60000000 / us;
        } else if (mt === 0x58 && !meta.timeSig) {
          meta.timeSig = { num: view.getUint8(pos.i), den: Math.pow(2, view.getUint8(pos.i + 1)) };
        } else if (mt === 0x59 && !meta.keySig) {
          meta.keySig = { sf: view.getInt8(pos.i), minor: view.getUint8(pos.i + 1) === 1 };
        } else if (mt === 0x03) {
          name = readStr(view, pos.i, ml);
          if (t === 0 && !meta.title) meta.title = name;
        }
        pos.i += ml;
        status = 0; // meta events cancel running status
        continue;
      }
      if (status === 0xf0 || status === 0xf7) {
        const sl = readVarLen(view, pos);
        pos.i += sl;
        status = 0;
        continue;
      }

      if (type === 0x90 || type === 0x80) {
        const note = view.getUint8(pos.i++);
        const vel = view.getUint8(pos.i++);
        const key = ch * 128 + note;
        if (type === 0x90 && vel > 0) {
          if (!open.has(key)) open.set(key, { start: tick, vel });
        } else {
          const o = open.get(key);
          if (o) {
            notes.push({ midi: note, start: o.start, end: tick, ch, vel: o.vel });
            open.delete(key);
          }
        }
        channels.add(ch);
      } else if (type === 0xa0 || type === 0xb0 || type === 0xe0) {
        pos.i += 2;
      } else if (type === 0xc0) {
        program = view.getUint8(pos.i++);
      } else if (type === 0xd0) {
        pos.i += 1;
      } else {
        break; // malformed
      }
    }
    if (notes.length > 0) {
      notes.sort((a, b) => a.start - b.start || b.midi - a.midi);
      const isDrums = channels.has(9) && channels.size === 1;
      tracks.push({ index: t, name: name || `Track ${t + 1}`, notes, program, isDrums });
    }
  }
  return { division, tracks, meta };
}

const PROGRAM_FAMILY = [
  'Piano', 'Chromatic Perc.', 'Organ', 'Guitar', 'Bass', 'Strings', 'Ensemble', 'Brass',
  'Reed', 'Pipe', 'Synth Lead', 'Synth Pad', 'Synth FX', 'Ethnic', 'Percussive', 'SFX',
];

/** Describe tracks for a picker, with a guess at the melody track. */
export function describeTracks(midi) {
  const list = midi.tracks.filter(t => !t.isDrums).map(t => {
    const avg = t.notes.reduce((s, n) => s + n.midi, 0) / t.notes.length;
    const family = t.program != null ? PROGRAM_FAMILY[Math.floor(t.program / 8)] : '';
    return { index: t.index, name: t.name, family, count: t.notes.length, avgPitch: avg };
  });
  // Melody guess: prefer leads/strings/reeds in a singable range with plenty of notes
  let best = null;
  let bestScore = -Infinity;
  for (const t of list) {
    let score = Math.log(t.count + 1) * 2 - Math.abs(t.avgPitch - 72) * 0.15;
    if (/lead|melody|vocal|voice|violin|fiddle|solo/i.test(t.name)) score += 4;
    if (['Synth Lead', 'Strings', 'Reed', 'Pipe', 'Brass'].includes(t.family)) score += 1.5;
    if (t.family === 'Bass') score -= 4;
    if (score > bestScore) { bestScore = score; best = t.index; }
  }
  return { tracks: list, suggested: best };
}

/**
 * Convert one MIDI track into a monophonic melody "parsed" object.
 * @param {object} midi - from parseMidi
 * @param {number} trackIndex
 * @param {string} title
 */
export function midiTrackToParsed(midi, trackIndex, title) {
  const track = midi.tracks.find(t => t.index === trackIndex);
  if (!track) throw new Error('Track not found');
  const div = midi.division;
  const minTicks = div / 8; // ignore anything shorter than a 32nd

  // Skyline: at each onset keep the highest note; truncate overlaps
  const onsets = [];
  for (const n of track.notes) {
    if (n.end - n.start < minTicks) continue;
    const last = onsets[onsets.length - 1];
    if (last && Math.abs(last.start - n.start) < div / 16) {
      if (n.midi > last.midi) Object.assign(last, n);
      continue;
    }
    onsets.push({ ...n });
  }
  for (let i = 0; i < onsets.length - 1; i++) {
    if (onsets[i].end > onsets[i + 1].start) onsets[i].end = onsets[i + 1].start;
  }

  // Quantize to a 1/16 grid
  const q = div / 4;
  const snap = (t) => Math.round(t / q) * q;
  const notes = [];
  for (const n of onsets) {
    const s = snap(n.start);
    const e = Math.max(s + q, snap(n.end));
    const prev = notes[notes.length - 1];
    if (prev && prev.startTick === s) continue;
    if (prev && prev.endTick > s) prev.endTick = s;
    notes.push({ midi: n.midi, startTick: s, endTick: e });
  }

  // Shift so the song starts at the first bar containing a note
  const ts = midi.meta.timeSig || { num: 4, den: 4 };
  const barTicks = div * ts.num * (4 / ts.den);
  const firstBar = notes.length ? Math.floor(notes[0].startTick / barTicks) : 0;
  const offset = firstBar * barTicks;

  const parsedNotes = notes.map((n, i) => ({
    midi: n.midi,
    start: (n.startTick - offset) / div,
    dur: Math.max(0.0625, (n.endTick - n.startTick) / div),
    i,
  }));
  const totalBeats = parsedNotes.length
    ? Math.ceil((parsedNotes[parsedNotes.length - 1].start + parsedNotes[parsedNotes.length - 1].dur) / (barTicks / div)) * (barTicks / div)
    : barTicks / div;

  const barBeats = barTicks / div;
  const meter = { num: ts.num, den: ts.den, text: `${ts.num}/${ts.den}` };
  const bars = [];
  const sections = [];
  const nBars = Math.round(totalBeats / barBeats);
  for (let b = 0; b < nBars; b++) {
    const secIdx = Math.floor(b / 8);
    const name = `Part ${secIdx + 1}`;
    bars.push({ start: b * barBeats, dur: barBeats, section: name, sectionKey: name, meter });
  }
  for (let s = 0; s * 8 < nBars; s++) {
    const b0 = s * 8;
    const b1 = Math.min(nBars, b0 + 8);
    sections.push({ key: `Part ${s + 1}`, name: `Part ${s + 1}`, start: b0 * barBeats, end: b1 * barBeats, barStart: b0, barEnd: b1 });
  }
  for (const n of parsedNotes) n.bar = Math.min(nBars - 1, Math.floor(n.start / barBeats + 1e-6));

  // Key from key signature, else C major
  const ks = midi.meta.keySig;
  const SHARP_MAJORS = ['Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
  const PCS = { C: 0, 'C#': 1, Db: 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11, Cb: 11 };
  const ORDER_S = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
  const ORDER_F = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
  let key = { tonic: 'C', mode: 'maj', accidentals: {}, tonicPc: 0, label: 'C' };
  if (ks) {
    const major = SHARP_MAJORS[ks.sf + 7] || 'C';
    const acc = {};
    if (ks.sf > 0) ORDER_S.slice(0, ks.sf).forEach(l => { acc[l] = 1; });
    if (ks.sf < 0) ORDER_F.slice(0, -ks.sf).forEach(l => { acc[l] = -1; });
    const pc = ks.minor ? (PCS[major] + 9) % 12 : PCS[major];
    const names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    key = { tonic: names[pc], mode: ks.minor ? 'min' : 'maj', accidentals: acc, tonicPc: pc, label: names[pc] + (ks.minor ? 'm' : '') };
  }

  return {
    title: title || midi.meta.title || track.name || 'Imported MIDI',
    composer: '',
    origin: 'Imported MIDI',
    rhythm: '',
    meter,
    key,
    tempo: Math.round(midi.meta.tempo || 120),
    notes: parsedNotes,
    bars,
    sections,
    chords: [],
    totalBeats,
  };
}
