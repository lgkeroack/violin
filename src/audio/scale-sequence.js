import { TUNING_PRESETS } from './tunings.js';
import { SCALES, getScaleNotes } from './scales.js';
import { frequencyToMidi, midiToFrequency, midiToNoteName } from './note-utils.js';

/**
 * Generate an ordered array of target notes for a scale practice sequence.
 *
 * @param {string} tuningKey - Key into TUNING_PRESETS
 * @param {number} rootPitchClass - 0=C .. 11=B
 * @param {string} scaleKey - Key into SCALES
 * @param {object} [options]
 * @param {number} [options.octaves=1] - How many octaves to span (1-3)
 * @param {string} [options.direction='asc'] - 'asc' | 'desc' | 'both'
 * @returns {Array<{midi:number, freq:number, noteName:string, octave:number, pitchClass:number, stringIndex:number, positionIndex:number}>}
 */
export function generateScaleSequence(tuningKey, rootPitchClass, scaleKey, options = {}) {
  const { octaves = 1, direction = 'asc' } = options;

  const preset = TUNING_PRESETS[tuningKey];
  if (!preset) return [];

  const scaleData = getScaleNotes(rootPitchClass, scaleKey);
  if (!scaleData) return [];

  const { pitchClasses } = scaleData;

  // Build all playable positions on the fingerboard that belong to the scale
  const positions = [];

  for (let si = 0; si < preset.strings.length; si++) {
    const str = preset.strings[si];
    for (let pos = 0; pos <= 12; pos++) {
      const freq = str.frequency * Math.pow(2, pos / 12);
      const midi = frequencyToMidi(freq);
      const pc = midi % 12;

      if (pitchClasses.has(pc)) {
        const { name, octave } = midiToNoteName(midi);
        positions.push({
          midi,
          freq: midiToFrequency(midi),
          noteName: name,
          octave,
          pitchClass: pc,
          stringIndex: si,
          positionIndex: pos,
        });
      }
    }
  }

  if (positions.length === 0) return [];

  // Sort ascending by MIDI
  positions.sort((a, b) => a.midi - b.midi);

  // Deduplicate by MIDI (keep first occurrence — prefer lower string)
  const unique = [];
  let lastMidi = -1;
  for (const p of positions) {
    if (p.midi !== lastMidi) {
      unique.push(p);
      lastMidi = p.midi;
    }
  }

  // Find the lowest root note on the fingerboard
  const rootPositions = unique.filter(p => p.pitchClass === rootPitchClass);
  if (rootPositions.length === 0) return unique; // fallback: all scale notes

  const lowestRootMidi = rootPositions[0].midi;
  const highestMidi = lowestRootMidi + (octaves * 12);

  // Filter to octave range
  const ranged = unique.filter(p => p.midi >= lowestRootMidi && p.midi <= highestMidi);

  if (ranged.length === 0) return [];

  // Apply direction
  if (direction === 'desc') {
    return ranged.slice().reverse();
  }
  if (direction === 'both') {
    // Up then down, excluding duplicate apex note
    const ascending = ranged.slice();
    const descending = ranged.slice().reverse().slice(1);
    return ascending.concat(descending);
  }
  // 'asc' (default)
  return ranged.slice();
}
