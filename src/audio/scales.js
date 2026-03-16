/**
 * Musical scale definitions and utility to compute scale notes.
 * Each scale is defined by its interval pattern (semitones from root).
 *
 * difficulty: 1 = beginner, 2 = easy, 3 = intermediate, 4 = advanced, 5 = expert
 * instruments: which instrument families this scale is commonly practiced on
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** All instrument families (matches tunings.js family values) */
export const INSTRUMENT_FAMILIES = [
  'Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle', 'Hardanger', 'Erhu',
];

/** Scale interval definitions */
export const SCALES = {
  'major': {
    label: 'Major (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    difficulty: 1,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle', 'Hardanger', 'Erhu'],
  },
  'natural-minor': {
    label: 'Natural Minor (Aeolian)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    difficulty: 1,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle', 'Hardanger', 'Erhu'],
  },
  'major-pentatonic': {
    label: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    difficulty: 1,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle', 'Erhu'],
  },
  'minor-pentatonic': {
    label: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    difficulty: 1,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle', 'Erhu'],
  },
  'harmonic-minor': {
    label: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    difficulty: 2,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle', 'Hardanger', 'Erhu'],
  },
  'melodic-minor': {
    label: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    difficulty: 2,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass'],
  },
  'dorian': {
    label: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    difficulty: 2,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle'],
  },
  'mixolydian': {
    label: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    difficulty: 2,
    instruments: ['Violin', 'Viola', 'Cello', 'Fiddle'],
  },
  'blues': {
    label: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    difficulty: 2,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle', 'Erhu'],
  },
  'phrygian': {
    label: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    difficulty: 3,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle'],
  },
  'lydian': {
    label: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    difficulty: 3,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass'],
  },
  'locrian': {
    label: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    difficulty: 4,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass'],
  },
  'whole-tone': {
    label: 'Whole Tone',
    intervals: [0, 2, 4, 6, 8, 10],
    difficulty: 3,
    instruments: ['Violin', 'Viola', 'Cello'],
  },
  'diminished-hw': {
    label: 'Diminished (H-W)',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    difficulty: 4,
    instruments: ['Violin', 'Viola', 'Cello'],
  },
  'diminished-wh': {
    label: 'Diminished (W-H)',
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    difficulty: 4,
    instruments: ['Violin', 'Viola', 'Cello'],
  },
  'chromatic': {
    label: 'Chromatic',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    difficulty: 3,
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass', 'Fiddle', 'Hardanger', 'Erhu'],
  },
};

export const ROOT_NOTES = NOTE_NAMES.map((name, i) => ({ value: String(i), label: name }));

/**
 * Get the set of pitch classes (0-11) for a given root and scale.
 * @param {number} rootPitchClass - 0=C, 1=C#, ..., 11=B
 * @param {string} scaleKey - key into SCALES
 * @returns {{ pitchClasses: Set<number>, root: number } | null}
 */
export function getScaleNotes(rootPitchClass, scaleKey) {
  const scale = SCALES[scaleKey];
  if (!scale) return null;

  const pitchClasses = new Set(
    scale.intervals.map(interval => (rootPitchClass + interval) % 12)
  );

  return { pitchClasses, root: rootPitchClass };
}

/** Difficulty label for display */
const DIFFICULTY_LABELS = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];

export function getDifficultyLabel(level) {
  return DIFFICULTY_LABELS[level] || '';
}
