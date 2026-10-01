/**
 * ABC notation parser (melody-only subset of ABC 2.1).
 *
 * Supports: header fields (X T C O R M L Q K P), inline fields ([K:..] etc.),
 * accidentals with bar-scoped persistence, key signatures with modes,
 * octave marks, note lengths, rests, ties, broken rhythm (> <), tuplets,
 * chords (melody = highest note), chord symbols (kept for backing),
 * grace notes / decorations (skipped), repeats with 1st/2nd endings,
 * and multi-voice tunes (first voice only).
 *
 * Output times are in quarter-note beats.
 */

const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
const MAJOR_SHARPS = {
  'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7,
  'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5, 'Gb': -6, 'Cb': -7,
  // enharmonic fallbacks
  'G#': 8, 'D#': 9, 'A#': 10, 'E#': 11, 'B#': 12, 'Fb': -8,
};
const MODE_OFFSET = {
  maj: 0, ion: 0, mix: -1, dor: -2, min: -3, aeo: -3, m: -3, phr: -4, loc: -5, lyd: 1,
};

/**
 * Parse a K: field value into key info.
 * @returns {{tonic:string, mode:string, accidentals:Object<string,number>, tonicPc:number, label:string}}
 */
export function parseKey(value) {
  const v = (value || '').trim();
  const result = { tonic: 'C', mode: 'maj', accidentals: {}, tonicPc: 0, label: 'C' };

  if (/^(HP|Hp)\b/.test(v)) {
    // Highland pipes: F# C#, G natural
    result.tonic = 'A';
    result.mode = 'mix';
    result.tonicPc = 9;
    result.accidentals = { F: 1, C: 1 };
    result.label = 'A Mix';
    return result;
  }
  if (/^none\b/i.test(v) || v === '') return result;

  const m = v.match(/^([A-Ga-g])([#b]?)\s*([A-Za-z]*)\s*(.*)$/);
  if (!m) return result;

  const tonic = m[1].toUpperCase() + m[2];
  const modeWord = m[3].toLowerCase();
  let mode = 'maj';
  if (modeWord === 'm') mode = 'min';
  else if (modeWord.length >= 3) {
    const k = modeWord.slice(0, 3);
    if (k in MODE_OFFSET) mode = k === 'aeo' ? 'min' : k === 'ion' ? 'maj' : k;
  }

  // Count of sharps (+) / flats (-) for the relative major
  const tonicMajorSharps = MAJOR_SHARPS[tonic] ?? 0;
  const sharps = tonicMajorSharps + MODE_OFFSET[mode];

  const acc = {};
  if (sharps > 0) {
    for (let i = 0; i < Math.min(sharps, 7); i++) acc[SHARP_ORDER[i]] = 1;
    // Beyond 7 sharps → double sharps (rare)
    for (let i = 7; i < sharps; i++) acc[SHARP_ORDER[i - 7]] = 2;
  } else if (sharps < 0) {
    for (let i = 0; i < Math.min(-sharps, 7); i++) acc[FLAT_ORDER[i]] = -1;
    for (let i = 7; i < -sharps; i++) acc[FLAT_ORDER[i - 7]] = -2;
  }

  // Explicit extra accidentals: "K:D =c ^g"
  const extra = m[4] || '';
  const re = /(\^\^|\^|__|_|=)([A-Ga-g])/g;
  let em;
  while ((em = re.exec(extra))) {
    const val = { '^^': 2, '^': 1, '__': -2, '_': -1, '=': 0 }[em[1]];
    acc[em[2].toUpperCase()] = val;
  }

  const tonicPc = (LETTER_PC[tonic[0]] + (tonic[1] === '#' ? 1 : tonic[1] === 'b' ? -1 : 0) + 12) % 12;
  const modeLabel = { maj: '', min: 'm', mix: ' Mix', dor: ' Dor', phr: ' Phr', lyd: ' Lyd', loc: ' Loc' }[mode];

  result.tonic = tonic;
  result.mode = mode;
  result.accidentals = acc;
  result.tonicPc = tonicPc;
  result.label = tonic + modeLabel;
  return result;
}

/** Parse a fraction like "3/8" or "C" or "C|" → number (whole-note units). */
function parseMeter(value) {
  const v = (value || '').trim();
  if (v === 'C') return { num: 4, den: 4, text: '4/4' };
  if (v === 'C|') return { num: 2, den: 2, text: '2/2' };
  const m = v.match(/^(\d+)(?:\+\d+)*\s*\/\s*(\d+)/);
  if (m) {
    // Handle additive numerators like 2+3+2/8
    const nums = v.split('/')[0].split('+').map(Number);
    const num = nums.reduce((a, b) => a + b, 0);
    return { num, den: Number(m[2]), text: `${num}/${m[2]}` };
  }
  return null;
}

function parseFraction(value) {
  const m = (value || '').trim().match(/^(\d+)\s*\/\s*(\d+)/);
  if (m) return Number(m[1]) / Number(m[2]);
  const n = parseFloat(value);
  return isFinite(n) ? n : null;
}

/**
 * Parse Q: field → quarter notes per minute.
 * Forms: "1/4=120", "3/8=100", "120", "\"Allegro\" 1/4=120"
 */
function parseTempo(value) {
  const v = (value || '').replace(/"[^"]*"/g, '').trim();
  const m = v.match(/((?:\d+\/\d+\s*)+)=\s*(\d+)/);
  if (m) {
    const beats = m[1].trim().split(/\s+/).reduce((sum, f) => sum + (parseFraction(f) || 0), 0);
    return Number(m[2]) * beats * 4; // quarter notes per minute
  }
  const n = v.match(/^(\d+)/);
  if (n) return Number(n[1]); // legacy: assume beats are unit length; treat as quarter bpm
  return null;
}

const DEFAULT_TEMPO_BY_RHYTHM = {
  reel: 150, jig: 165, 'slip jig': 165, hornpipe: 130, polka: 140, waltz: 120,
  march: 110, strathspey: 100, slide: 180, mazurka: 120, barndance: 130,
  'three-two': 120, air: 80, hymn: 90,
};

/** Split an ABC document into individual tune strings (on X: fields). */
export function splitTunes(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const tunes = [];
  let current = null;
  for (const line of lines) {
    if (/^X:/.test(line)) {
      if (current) tunes.push(current.join('\n'));
      current = [line];
    } else if (current) {
      current.push(line);
    } else if (/^[TKM]:/.test(line)) {
      // ABC without X: — start implicitly
      current = ['X:1', line];
    }
  }
  if (current) tunes.push(current.join('\n'));
  return tunes;
}

/**
 * Parse a single ABC tune.
 * @param {string} abc
 * @returns {{
 *   title:string, composer:string, origin:string, rhythm:string,
 *   meter:{num:number,den:number,text:string}, key:object, tempo:number,
 *   notes:Array<{midi:number,start:number,dur:number,chord?:string}>,
 *   bars:Array<{start:number,dur:number,section:string}>,
 *   sections:Array<{name:string,start:number,end:number,barStart:number,barEnd:number}>,
 *   chords:Array<{start:number,symbol:string}>,
 *   totalBeats:number
 * }}
 */
export function parseABC(abc) {
  const lines = abc.replace(/\r\n?/g, '\n').split('\n');

  const header = { title: '', titles: [], composer: '', origin: '', rhythm: '' };
  let meter = { num: 4, den: 4, text: '4/4' };
  let meterSet = false;
  let unitLen = null;
  let tempo = null;
  let key = parseKey('C');
  let inBody = false;

  const bodyLines = [];

  for (const raw of lines) {
    const line = raw.replace(/(^|[^\\])%.*$/, '$1'); // strip comments
    if (!inBody) {
      const fm = line.match(/^([A-Za-z]):\s?(.*)$/);
      if (!fm) {
        if (line.trim() === '') continue;
        // Body begins without K: — be lenient
        inBody = true;
        bodyLines.push(line);
        continue;
      }
      const [, f, val] = fm;
      switch (f) {
        case 'T': header.titles.push(val.trim()); break;
        case 'C': header.composer = header.composer || val.trim(); break;
        case 'O': header.origin = header.origin || val.trim(); break;
        case 'R': header.rhythm = val.trim().toLowerCase(); break;
        case 'M': { const mm = parseMeter(val); if (mm) { meter = mm; meterSet = true; } break; }
        case 'L': unitLen = parseFraction(val); break;
        case 'Q': tempo = parseTempo(val); break;
        case 'K': key = parseKey(val); inBody = true; break;
        default: break;
      }
    } else {
      bodyLines.push(line);
    }
  }

  header.title = header.titles[0] || 'Untitled';

  if (!unitLen) {
    const ratio = meter.num / meter.den;
    unitLen = (meterSet && ratio < 0.75) ? 1 / 16 : 1 / 8;
  }
  if (!tempo) {
    tempo = DEFAULT_TEMPO_BY_RHYTHM[header.rhythm] || 120;
  }

  const initial = { meter, unitLen, tempo, key };
  const { bars } = tokenizeBody(bodyLines, initial);
  const expanded = expandRepeats(bars);
  return buildTimeline(header, initial, expanded);
}

/**
 * Tokenize body text into bars of events.
 * Each bar: { events:[], startRepeat, endRepeat, ending:number[]|null, part, doubleBar }
 * Event: { type:'note'|'rest', midi?, dur (quarter beats), tie?, chord? }
 */
function tokenizeBody(bodyLines, initial) {
  let { unitLen, key } = initial;
  let meter = initial.meter;

  const bars = [];
  let bar = newBar();
  let barAccidentals = {}; // "F4" → semitone offset
  let currentEnding = null;
  let pendingChord = null;
  let partLabel = '';
  let voiceSeen = null; // first voice id
  let skipVoice = false;

  // Tuplet state
  let tupletRemaining = 0;
  let tupletRatio = 1;

  // Broken rhythm state
  let brokenNext = 1; // multiplier to apply to next note

  function newBar() {
    return { events: [], startRepeat: false, endRepeat: false, ending: null, part: '', doubleBar: false, meter: null };
  }

  function pushBar(opts = {}) {
    if (bar.events.length > 0 || opts.force) {
      bar.ending = currentEnding;
      bar.part = partLabel;
      bar.meter = meter;
      bars.push(bar);
    }
    bar = newBar();
    barAccidentals = {};
  }

  function lastNoteEvent() {
    for (let i = bar.events.length - 1; i >= 0; i--) {
      if (bar.events[i].type !== 'marker') return bar.events[i];
    }
    for (let b = bars.length - 1; b >= 0; b--) {
      const evs = bars[b].events;
      for (let i = evs.length - 1; i >= 0; i--) {
        if (evs[i].type !== 'marker') return evs[i];
      }
    }
    return null;
  }

  function applyField(f, val) {
    switch (f) {
      case 'K': key = parseKey(val); break;
      case 'L': { const u = parseFraction(val); if (u) unitLen = u; break; }
      case 'M': { const mm = parseMeter(val); if (mm) meter = mm; break; }
      case 'P': partLabel = val.trim(); break;
      default: break;
    }
  }

  for (const rawLine of bodyLines) {
    let line = rawLine;
    const fm = line.match(/^([A-Za-z]):\s?(.*)$/);
    if (fm) {
      const [, f, val] = fm;
      if (f === 'V') {
        const id = val.trim().split(/\s+/)[0];
        if (voiceSeen === null) voiceSeen = id;
        skipVoice = id !== voiceSeen;
      } else if (f === 'w' || f === 'W') {
        // lyrics — ignore
      } else if (!skipVoice) {
        applyField(f, val);
      }
      continue;
    }
    if (skipVoice) continue;

    line = line.replace(/\\\s*$/, ''); // continuation
    let i = 0;
    const n = line.length;

    while (i < n) {
      const c = line[i];

      // Whitespace / spacers
      if (c === ' ' || c === '\t' || c === 'y' || c === '`') { i++; continue; }

      // Inline field [K:...]
      if (c === '[' && /[A-Za-z]/.test(line[i + 1] || '') && line[i + 2] === ':') {
        const end = line.indexOf(']', i);
        if (end > i) {
          const f = line[i + 1];
          const val = line.slice(i + 3, end);
          if (f === 'V') {
            const id = val.trim().split(/\s+/)[0];
            if (voiceSeen === null) voiceSeen = id;
            skipVoice = id !== voiceSeen;
          } else {
            applyField(f, val);
          }
          i = end + 1;
          if (skipVoice) break;
          continue;
        }
      }

      // Chord symbol / annotation "G" or "^text"
      if (c === '"') {
        const end = line.indexOf('"', i + 1);
        const text = end > i ? line.slice(i + 1, end) : '';
        if (/^[A-G]/.test(text)) pendingChord = text.split(/[\s(/]/)[0];
        i = end > i ? end + 1 : n;
        continue;
      }

      // Decorations !...! or +...+
      if (c === '!' || c === '+') {
        const end = line.indexOf(c, i + 1);
        i = end > i ? end + 1 : i + 1;
        continue;
      }

      // Grace notes {...}
      if (c === '{') {
        const end = line.indexOf('}', i);
        i = end > i ? end + 1 : n;
        continue;
      }

      // Shorthand decorations
      if ('.~HLMOPSTuvJR'.includes(c)) { i++; continue; }

      // Slurs
      if (c === ')' ) { i++; continue; }
      if (c === '(') {
        // Tuplet?
        const tm = line.slice(i).match(/^\((\d)(?::(\d)?)?(?::(\d)?)?/);
        if (tm) {
          const p = Number(tm[1]);
          let q = tm[2] ? Number(tm[2]) : null;
          const r = tm[3] ? Number(tm[3]) : p;
          if (!q) {
            const compound = meter.num % 3 === 0 && meter.num > 3;
            q = { 2: 3, 3: 2, 4: 3, 6: 2, 8: 3 }[p] ?? (compound ? 3 : 2);
          }
          tupletRatio = q / p;
          tupletRemaining = r;
          i += tm[0].length;
          continue;
        }
        i++;
        continue;
      }

      // Bar lines / repeats
      if (c === '|' || c === ':' || (c === '[' && (line[i + 1] === '|' || /\d/.test(line[i + 1] || '')))) {
        const bm = line.slice(i).match(/^(:*)(\|\]|\[\||\|\||\||\[(?=\d))?(:*)(\[?\d+(?:[-,]\d+)*)?/);
        if (bm && bm[0].length > 0) {
          const pre = bm[1];
          const barSym = bm[2] || '';
          let post = bm[3];
          let endingStr = bm[4] || '';

          // "::" with no bar symbol acts as end + start repeat
          const isEnd = pre.length > 0;
          if (!barSym && pre.length >= 2) post = ':';
          const isStart = post.length > 0;
          const isDouble = barSym === '||' || barSym === '|]' || barSym === '[|';

          if (barSym || isEnd || isStart) {
            if (bar.events.length === 0) {
              // Empty bar (e.g. "| |:" or "|:|") — attach flags to the previous bar
              const prevBar = bars[bars.length - 1];
              if (prevBar) {
                if (isEnd) prevBar.endRepeat = true;
                if (isDouble) prevBar.doubleBar = true;
              }
            } else {
              if (isEnd) bar.endRepeat = true;
              if (isDouble) bar.doubleBar = true;
              pushBar();
            }
            if (isEnd || isDouble) currentEnding = null;
          }

          if (isStart) {
            bar.startRepeat = true;
            currentEnding = null;
          }

          if (endingStr) {
            endingStr = endingStr.replace('[', '');
            const nums = [];
            for (const part of endingStr.split(',')) {
              const [a, b] = part.split('-').map(Number);
              if (b) for (let k = a; k <= b; k++) nums.push(k);
              else nums.push(a);
            }
            currentEnding = nums;
          }

          // When "[" introduces an ending with no barline (e.g. "[2"), nothing else to push
          i += bm[0].length;
          continue;
        }
        i++;
        continue;
      }

      // Broken rhythm
      if (c === '>' || c === '<') {
        let count = 0;
        const ch = c;
        while (line[i] === ch) { count++; i++; }
        const factor = 1 - Math.pow(0.5, count); // > : 0.5, >> : 0.75
        const prev = lastNoteEvent();
        if (prev) {
          if (ch === '>') {
            prev.dur *= (1 + factor);
            brokenNext = 1 - factor;
          } else {
            prev.dur *= (1 - factor);
            brokenNext = 1 + factor;
          }
        }
        continue;
      }

      // Tie
      if (c === '-') {
        const prev = lastNoteEvent();
        if (prev && prev.type === 'note') prev.tie = true;
        i++;
        continue;
      }

      // Chord [ceg]
      if (c === '[') {
        const end = line.indexOf(']', i);
        if (end > i) {
          const inner = line.slice(i + 1, end);
          let best = null;
          let firstLen = null;
          const nre = /(\^\^|\^|__|_|=)?([A-Ga-g])([,']*)(\d*\/*\d*)/g;
          let nm;
          while ((nm = nre.exec(inner))) {
            const midi = resolvePitch(nm[1], nm[2], nm[3], key, barAccidentals);
            if (firstLen === null) firstLen = parseLength(nm[4]);
            if (best === null || midi > best) best = midi;
          }
          i = end + 1;
          // length after the bracket
          const lm = line.slice(i).match(/^(\d*\/*\d*)/);
          let mult = firstLen ?? 1;
          if (lm && lm[1]) { mult = parseLength(lm[1]); i += lm[1].length; }
          if (best !== null) {
            addEvent({ type: 'note', midi: best }, mult);
          }
          continue;
        }
        i++;
        continue;
      }

      // Note
      const nm = line.slice(i).match(/^(\^\^|\^|__|_|=)?([A-Ga-g])([,']*)(\d*\/*\d*)/);
      if (nm) {
        const midi = resolvePitch(nm[1], nm[2], nm[3], key, barAccidentals);
        addEvent({ type: 'note', midi }, parseLength(nm[4]));
        i += nm[0].length;
        continue;
      }

      // Rest
      const rm = line.slice(i).match(/^([zx])(\d*\/*\d*)/);
      if (rm) {
        addEvent({ type: 'rest' }, parseLength(rm[2]));
        i += rm[0].length;
        continue;
      }
      // Multi-measure rest Z4
      const zm = line.slice(i).match(/^Z(\d*)/);
      if (zm) {
        const count = zm[1] ? Number(zm[1]) : 1;
        const barBeats = meter.num * (4 / meter.den);
        for (let k = 0; k < count; k++) {
          bar.events.push({ type: 'rest', dur: barBeats });
          if (k < count - 1) pushBar();
        }
        i += zm[0].length;
        continue;
      }

      // Unknown char — skip
      i++;
    }
  }
  pushBar();

  function addEvent(ev, mult) {
    let dur = mult * unitLen * 4; // quarter beats
    if (tupletRemaining > 0) {
      dur *= tupletRatio;
      tupletRemaining--;
    }
    if (brokenNext !== 1) {
      dur *= brokenNext;
      brokenNext = 1;
    }
    ev.dur = dur;
    if (pendingChord) { ev.chord = pendingChord; pendingChord = null; }
    bar.events.push(ev);
  }

  return { bars };
}

function parseLength(str) {
  if (!str) return 1;
  const m = str.match(/^(\d*)(\/*)(\d*)$/);
  if (!m) return 1;
  const num = m[1] ? Number(m[1]) : 1;
  let den = 1;
  if (m[2].length > 0) {
    den = m[3] ? Number(m[3]) : Math.pow(2, m[2].length);
    if (m[3] && m[2].length > 1) den = Number(m[3]) * Math.pow(2, m[2].length - 1);
  }
  return num / den;
}

function resolvePitch(accStr, letter, octStr, key, barAcc) {
  const upper = letter.toUpperCase();
  let octave = letter === upper ? 4 : 5;
  for (const ch of octStr || '') {
    if (ch === "'") octave++;
    else if (ch === ',') octave--;
  }
  const keyName = upper + octave;
  let alter;
  if (accStr) {
    alter = { '^^': 2, '^': 1, '__': -2, '_': -1, '=': 0 }[accStr];
    barAcc[keyName] = alter;
  } else if (keyName in barAcc) {
    alter = barAcc[keyName];
  } else {
    alter = key.accidentals[upper] || 0;
  }
  return (octave + 1) * 12 + LETTER_PC[upper] + alter;
}

/** Expand repeats and endings into a linear list of bars (with pass info). */
function expandRepeats(bars) {
  const out = [];
  let repStart = 0;
  let pass = 1;
  let jumpedTo = -1;
  let guard = 0;
  let i = 0;
  // Section numbering: each repeat block / double-bar block gets a letter
  let sectionIdx = 0;
  let lastSectionKey = null;

  while (i < bars.length && guard++ < 10000) {
    const b = bars[i];
    if (b.startRepeat && jumpedTo !== i) {
      repStart = i;
      pass = 1;
    }
    jumpedTo = -1;

    if (b.ending && !b.ending.includes(pass)) {
      i++;
      continue;
    }

    out.push({ ...b, pass, blockStart: repStart });

    if (b.endRepeat) {
      if (pass < 2) {
        pass++;
        i = repStart;
        jumpedTo = repStart;
        continue;
      }
      pass = 1;
      repStart = i + 1;
    } else if (b.doubleBar) {
      repStart = i + 1;
      pass = 1;
    }
    i++;
  }

  // Assign section labels: new section when block start changes or pass changes
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const blockLetter = new Map();
  for (const b of out) {
    const k = b.part || b.blockStart;
    if (!blockLetter.has(k)) blockLetter.set(k, b.part || letters[sectionIdx++ % 26]);
    const letter = blockLetter.get(k);
    const key = `${k}|${b.pass}`;
    if (key !== lastSectionKey) {
      lastSectionKey = key;
    }
    b.section = b.pass > 1 ? `${letter} (repeat)` : letter;
    b.sectionKey = key;
  }
  return out;
}

function buildTimeline(header, initial, bars) {
  const notes = [];
  const chords = [];
  const barList = [];
  let t = 0;

  for (const b of bars) {
    const barStart = t;
    for (const ev of b.events) {
      if (ev.chord) chords.push({ start: t, symbol: ev.chord });
      if (ev.type === 'note') {
        const prev = notes[notes.length - 1];
        if (prev && prev.tie && prev.midi === ev.midi && Math.abs(prev.start + prev.dur - t) < 1e-6) {
          prev.dur += ev.dur;
          prev.tie = !!ev.tie;
        } else {
          notes.push({ midi: ev.midi, start: t, dur: ev.dur, tie: !!ev.tie, bar: barList.length });
        }
      }
      t += ev.dur;
    }
    const meter = b.meter || initial.meter;
    barList.push({ start: barStart, dur: t - barStart, section: b.section, sectionKey: b.sectionKey, meter });
  }

  for (const n of notes) delete n.tie;

  // Sections: contiguous runs of the same sectionKey
  const sections = [];
  for (let bi = 0; bi < barList.length; bi++) {
    const b = barList[bi];
    const last = sections[sections.length - 1];
    if (last && last.key === b.sectionKey) {
      last.end = b.start + b.dur;
      last.barEnd = bi + 1;
    } else {
      sections.push({ key: b.sectionKey, name: b.section, start: b.start, end: b.start + b.dur, barStart: bi, barEnd: bi + 1 });
    }
  }

  return {
    title: header.title,
    composer: header.composer,
    origin: header.origin,
    rhythm: header.rhythm,
    meter: initial.meter,
    key: initial.key,
    tempo: initial.tempo,
    notes,
    bars: barList,
    sections,
    chords,
    totalBeats: t,
  };
}
