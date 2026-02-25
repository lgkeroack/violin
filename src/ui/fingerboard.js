import { TUNING_PRESETS, DEFAULT_TUNING } from '../audio/tunings.js';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const POSITIONS = 13; // open + 12 semitones

/** Get note name for a given frequency */
function freqToNoteName(freq) {
  const semi = 12 * Math.log2(freq / 440);
  const noteIndex = Math.round(semi) % 12;
  return NOTE_NAMES[(noteIndex + 12 + 9) % 12]; // A=440 is index 9
}

export class Fingerboard {
  constructor(container) {
    this.container = container;
    this.currentTuning = DEFAULT_TUNING;
    this.rows = [];
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

        // Calculate note name at this position
        const posFreq = str.frequency * Math.pow(2, i / 12);
        const noteName = freqToNoteName(posFreq);
        dot.title = i === 0 ? `${str.name} (open)` : noteName;
        dot.setAttribute('data-note', i === 0 ? str.name : noteName);

        row.appendChild(dot);
        positions.push(dot);
      }

      this.el.appendChild(row);
      this.rows.push({ el: row, positions, frequency: str.frequency });
    }
  }

  update(detectedFreq) {
    // Clear all highlights
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
}
