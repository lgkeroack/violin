import { TUNING_PRESETS, DEFAULT_TUNING } from '../audio/tunings.js';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const POSITIONS = 13; // open + 12 semitones

/** Convert frequency to MIDI-style pitch class (0-11, C=0) */
function freqToPitchClass(freq) {
  const semi = 12 * Math.log2(freq / 440);
  const noteIndex = Math.round(semi) % 12;
  return (noteIndex + 12 + 9) % 12; // A=440 is index 9 (pitch class 9)
}

/** Get note name for a given frequency */
function freqToNoteName(freq) {
  return NOTE_NAMES[freqToPitchClass(freq)];
}

export class Fingerboard {
  constructor(container) {
    this.container = container;
    this.currentTuning = DEFAULT_TUNING;
    this.rows = [];
    this._scaleData = null; // { pitchClasses: Set<number>, root: number } | null
    this._build();
    this.setTuning(DEFAULT_TUNING);
  }

  _build() {
    this.el = document.createElement('div');
    this.el.className = 'fingerboard';
    this.container.appendChild(this.el);
  }

  setTuning(tuningKey) {
    this.currentTuning = tuningKey;
    const preset = TUNING_PRESETS[tuningKey];
    if (!preset) return;

    this.el.innerHTML = '';
    this.rows = [];

    for (const str of preset.strings) {
      const row = document.createElement('div');
      row.className = 'fb-string-row';

      const label = document.createElement('span');
      label.className = 'fb-string-label';
      label.textContent = str.name;
      row.appendChild(label);

      const positions = [];
      for (let i = 0; i < POSITIONS; i++) {
        const dot = document.createElement('span');
        dot.className = 'fb-position';
        if (i === 0) dot.classList.add('open');

        // Calculate note name and pitch class at this position
        const posFreq = str.frequency * Math.pow(2, i / 12);
        const noteName = freqToNoteName(posFreq);
        const pitchClass = freqToPitchClass(posFreq);
        dot.title = i === 0 ? `${str.name} (open)` : noteName;
        dot.setAttribute('data-note', i === 0 ? str.name : noteName);
        dot.dataset.pitchClass = pitchClass;

        row.appendChild(dot);
        positions.push(dot);
      }

      this.el.appendChild(row);
      this.rows.push({ el: row, positions, frequency: str.frequency });
    }

    // Re-apply scale highlights after tuning change
    this._applyScaleHighlights();
  }

  /**
   * Set scale to highlight on the fingerboard.
   * @param {{ pitchClasses: Set<number>, root: number } | null} scaleData
   */
  setScale(scaleData) {
    this._scaleData = scaleData;
    this._applyScaleHighlights();
  }

  _applyScaleHighlights() {
    for (const row of this.rows) {
      for (const dot of row.positions) {
        dot.classList.remove('scale-tone', 'scale-root');

        if (!this._scaleData) continue;

        const pc = parseInt(dot.dataset.pitchClass, 10);
        if (this._scaleData.pitchClasses.has(pc)) {
          dot.classList.add('scale-tone');
          if (pc === this._scaleData.root) {
            dot.classList.add('scale-root');
          }
        }
      }
    }
  }

  update(detectedFreq) {
    // Clear detection highlights (not scale highlights or trainer highlights)
    for (const row of this.rows) {
      row.el.classList.remove('bowed');
      for (const dot of row.positions) {
        dot.classList.remove('active');
      }
    }

    if (!detectedFreq) return;

    // Find best string + position
    let bestRow = null;
    let bestPos = -1;
    let bestError = Infinity;

    for (const row of this.rows) {
      const semi = 12 * Math.log2(detectedFreq / row.frequency);
      if (semi < -0.5 || semi > 12.5) continue; // outside fingerboard range

      const rounded = Math.round(semi);
      if (rounded < 0 || rounded >= POSITIONS) continue;

      const error = Math.abs(semi - rounded);
      if (error < bestError) {
        bestError = error;
        bestRow = row;
        bestPos = rounded;
      }
    }

    if (bestRow && bestPos >= 0) {
      bestRow.el.classList.add('bowed');
      bestRow.positions[bestPos].classList.add('active');
    }
  }

  /**
   * Highlight a specific dot as the current trainer target (yellow pulse).
   * Removes any previous trainer-target highlight.
   */
  setTrainerTarget(stringIndex, positionIndex) {
    // Clear previous target
    for (const row of this.rows) {
      for (const dot of row.positions) {
        dot.classList.remove('trainer-target');
      }
    }
    if (stringIndex >= 0 && stringIndex < this.rows.length) {
      const dot = this.rows[stringIndex].positions[positionIndex];
      if (dot) dot.classList.add('trainer-target');
    }
  }

  /**
   * Flash a dot green on a successful hit, then mark it as done.
   */
  markTrainerHit(stringIndex, positionIndex) {
    if (stringIndex < 0 || stringIndex >= this.rows.length) return;
    const dot = this.rows[stringIndex].positions[positionIndex];
    if (!dot) return;

    dot.classList.remove('trainer-target');
    dot.classList.add('trainer-hit');

    setTimeout(() => {
      dot.classList.remove('trainer-hit');
      dot.classList.add('trainer-done');
    }, 300);
  }

  /**
   * Remove all trainer state from the fingerboard.
   */
  clearTrainerState() {
    for (const row of this.rows) {
      for (const dot of row.positions) {
        dot.classList.remove('trainer-target', 'trainer-hit', 'trainer-done');
      }
    }
  }
}
