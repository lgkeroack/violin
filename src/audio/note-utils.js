const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4_FREQ = 440;
const A4_MIDI = 69;

/**
 * Convert frequency to the nearest MIDI note number.
 */
export function frequencyToMidi(freq) {
  return Math.round(12 * Math.log2(freq / A4_FREQ) + A4_MIDI);
}

/**
 * Convert MIDI note number to frequency.
 */
export function midiToFrequency(midi) {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

/**
 * Get note name and octave from a MIDI note number.
 */
export function midiToNoteName(midi) {
  const name = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { name, octave };
}

/**
 * Calculate cents deviation from the nearest note.
 * Positive = sharp, negative = flat.
 */
export function frequencyToCents(freq) {
  const midi = 12 * Math.log2(freq / A4_FREQ) + A4_MIDI;
  const nearestMidi = Math.round(midi);
  return (midi - nearestMidi) * 100;
}

/**
 * Full note info from a frequency.
 */
export function getNoteInfo(freq) {
  if (!freq || freq < 20 || freq > 10000) return null;
  const midi = frequencyToMidi(freq);
  const { name, octave } = midiToNoteName(midi);
  const cents = frequencyToCents(freq);
  const expectedFreq = midiToFrequency(midi);
  return { name, octave, midi, cents, frequency: freq, expectedFreq };
}
