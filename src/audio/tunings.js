/**
 * String tuning presets for violin-family and similar instruments.
 * Strings are ordered low to high (as physically positioned, thick to thin).
 * Each string: { name, note, octave, frequency }
 */

// Standard A4 = 440 Hz reference
const A4 = 440;
const semitone = (n) => A4 * Math.pow(2, n / 12);
// n = semitones from A4

export const TUNING_PRESETS = {
  // Violins
  'violin-standard': {
    label: 'Violin (GDAE)',
    family: 'Violin',
    strings: [
      { name: 'G', note: 'G', octave: 3, frequency: semitone(-14) },  // G3 ~196.0
      { name: 'D', note: 'D', octave: 4, frequency: semitone(-7) },   // D4 ~293.7
      { name: 'A', note: 'A', octave: 4, frequency: A4 },              // A4 440.0
      { name: 'E', note: 'E', octave: 5, frequency: semitone(7) },     // E5 ~659.3
    ],
  },
  'violin-drop-g': {
    label: 'Violin Drop G (GDGD)',
    family: 'Violin',
    strings: [
      { name: 'G', note: 'G', octave: 3, frequency: semitone(-14) },
      { name: 'D', note: 'D', octave: 4, frequency: semitone(-7) },
      { name: 'G', note: 'G', octave: 4, frequency: semitone(-2) },
      { name: 'D', note: 'D', octave: 5, frequency: semitone(5) },
    ],
  },
  'violin-cross': {
    label: 'Violin Cross (AEAE)',
    family: 'Violin',
    strings: [
      { name: 'A', note: 'A', octave: 3, frequency: semitone(-12) },
      { name: 'E', note: 'E', octave: 4, frequency: semitone(-5) },
      { name: 'A', note: 'A', octave: 4, frequency: A4 },
      { name: 'E', note: 'E', octave: 5, frequency: semitone(7) },
    ],
  },

  // 5-string violin
  '5string-violin': {
    label: '5-String Violin (CGDAE)',
    family: 'Violin',
    strings: [
      { name: 'C', note: 'C', octave: 3, frequency: semitone(-21) },  // C3
      { name: 'G', note: 'G', octave: 3, frequency: semitone(-14) },
      { name: 'D', note: 'D', octave: 4, frequency: semitone(-7) },
      { name: 'A', note: 'A', octave: 4, frequency: A4 },
      { name: 'E', note: 'E', octave: 5, frequency: semitone(7) },
    ],
  },

  // Viola
  'viola-standard': {
    label: 'Viola (CGDA)',
    family: 'Viola',
    strings: [
      { name: 'C', note: 'C', octave: 3, frequency: semitone(-21) },
      { name: 'G', note: 'G', octave: 3, frequency: semitone(-14) },
      { name: 'D', note: 'D', octave: 4, frequency: semitone(-7) },
      { name: 'A', note: 'A', octave: 4, frequency: A4 },
    ],
  },

  // Cello
  'cello-standard': {
    label: 'Cello (CGDA)',
    family: 'Cello',
    strings: [
      { name: 'C', note: 'C', octave: 2, frequency: semitone(-33) },
      { name: 'G', note: 'G', octave: 2, frequency: semitone(-26) },
      { name: 'D', note: 'D', octave: 3, frequency: semitone(-19) },
      { name: 'A', note: 'A', octave: 3, frequency: semitone(-12) },
    ],
  },

  // Double bass
  'bass-standard': {
    label: 'Double Bass (EADG)',
    family: 'Double Bass',
    strings: [
      { name: 'E', note: 'E', octave: 1, frequency: semitone(-41) },
      { name: 'A', note: 'A', octave: 1, frequency: semitone(-36) },
      { name: 'D', note: 'D', octave: 2, frequency: semitone(-31) },
      { name: 'G', note: 'G', octave: 2, frequency: semitone(-26) },
    ],
  },
  'bass-5string': {
    label: '5-String Bass (BEADG)',
    family: 'Double Bass',
    strings: [
      { name: 'B', note: 'B', octave: 0, frequency: semitone(-46) },
      { name: 'E', note: 'E', octave: 1, frequency: semitone(-41) },
      { name: 'A', note: 'A', octave: 1, frequency: semitone(-36) },
      { name: 'D', note: 'D', octave: 2, frequency: semitone(-31) },
      { name: 'G', note: 'G', octave: 2, frequency: semitone(-26) },
    ],
  },

  // Fiddle alternate tunings
  'fiddle-open-g': {
    label: 'Fiddle Open G (GDGB)',
    family: 'Fiddle',
    strings: [
      { name: 'G', note: 'G', octave: 3, frequency: semitone(-14) },
      { name: 'D', note: 'D', octave: 4, frequency: semitone(-7) },
      { name: 'G', note: 'G', octave: 4, frequency: semitone(-2) },
      { name: 'B', note: 'B', octave: 4, frequency: semitone(2) },
    ],
  },
  'fiddle-open-d': {
    label: 'Fiddle Open D (DADF#)',
    family: 'Fiddle',
    strings: [
      { name: 'D', note: 'D', octave: 3, frequency: semitone(-19) },
      { name: 'A', note: 'A', octave: 3, frequency: semitone(-12) },
      { name: 'D', note: 'D', octave: 4, frequency: semitone(-7) },
      { name: 'F#', note: 'F#', octave: 4, frequency: semitone(-3) },
    ],
  },
  'fiddle-calico': {
    label: 'Fiddle Calico (AEAC#)',
    family: 'Fiddle',
    strings: [
      { name: 'A', note: 'A', octave: 3, frequency: semitone(-12) },
      { name: 'E', note: 'E', octave: 4, frequency: semitone(-5) },
      { name: 'A', note: 'A', octave: 4, frequency: A4 },
      { name: 'C#', note: 'C#', octave: 5, frequency: semitone(4) },
    ],
  },

  // Hardingfele (Hardanger fiddle)
  'hardingfele': {
    label: 'Hardingfele (ADAE)',
    family: 'Hardanger',
    strings: [
      { name: 'A', note: 'A', octave: 3, frequency: semitone(-12) },
      { name: 'D', note: 'D', octave: 4, frequency: semitone(-7) },
      { name: 'A', note: 'A', octave: 4, frequency: A4 },
      { name: 'E', note: 'E', octave: 5, frequency: semitone(7) },
    ],
  },

  // Erhu
  'erhu': {
    label: 'Erhu (DA)',
    family: 'Erhu',
    strings: [
      { name: 'D', note: 'D', octave: 4, frequency: semitone(-7) },
      { name: 'A', note: 'A', octave: 4, frequency: A4 },
    ],
  },
};

export const DEFAULT_TUNING = 'violin-standard';
