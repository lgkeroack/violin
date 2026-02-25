import { getNoteInfo } from '../audio/note-utils.js';

export class PitchDisplay {
  constructor(container) {
    this.container = container;
    this._build();
    this._lastNote = null;
  }

  _build() {
    this.container.innerHTML = '';

    const display = document.createElement('div');
    display.className = 'pitch-display';

    // Note name
    this.noteEl = document.createElement('div');
    this.noteEl.className = 'pitch-note inactive';
    this.noteEl.innerHTML = '&mdash;';
    display.appendChild(this.noteEl);

    // Frequency
    this.freqEl = document.createElement('div');
    this.freqEl.className = 'pitch-frequency';
    this.freqEl.textContent = '--- Hz';
    display.appendChild(this.freqEl);

    // Cents gauge
    const gauge = document.createElement('div');
    gauge.className = 'cents-gauge';

    const barBg = document.createElement('div');
    barBg.className = 'cents-bar-bg';

    const centerLine = document.createElement('div');
    centerLine.className = 'cents-center-line';
    barBg.appendChild(centerLine);

    this.indicator = document.createElement('div');
    this.indicator.className = 'cents-indicator';
    barBg.appendChild(this.indicator);

    gauge.appendChild(barBg);

    const labels = document.createElement('div');
    labels.className = 'cents-labels';
    labels.innerHTML = '<span>-50</span><span>0</span><span>+50</span>';
    gauge.appendChild(labels);

    this.centsValueEl = document.createElement('div');
    this.centsValueEl.className = 'cents-value';
    this.centsValueEl.textContent = '';
    gauge.appendChild(this.centsValueEl);

    display.appendChild(gauge);
    this.container.appendChild(display);
  }

  update(frequency) {
    if (!frequency) {
      this.noteEl.classList.add('inactive');
      return;
    }

    const info = getNoteInfo(frequency);
    if (!info) {
      this.noteEl.classList.add('inactive');
      return;
    }

    this.noteEl.classList.remove('inactive');
    this.noteEl.innerHTML = `${info.name}<span class="octave">${info.octave}</span>`;
    this.freqEl.textContent = `${info.frequency.toFixed(1)} Hz`;

    // Cents gauge
    const cents = info.cents;
    const clamped = Math.max(-50, Math.min(50, cents));
    const pct = 50 + (clamped / 50) * 50; // 0% = -50c, 50% = 0c, 100% = +50c
    this.indicator.style.left = `${pct}%`;

    // Color coding
    const absCents = Math.abs(cents);
    let color;
    if (absCents < 5) {
      color = 'var(--green)';
    } else if (absCents < 15) {
      color = 'var(--yellow)';
    } else {
      color = 'var(--red)';
    }
    this.indicator.style.background = color;

    const sign = cents >= 0 ? '+' : '';
    this.centsValueEl.textContent = `${sign}${cents.toFixed(1)} cents`;
    this.centsValueEl.style.color = color;
  }
}
