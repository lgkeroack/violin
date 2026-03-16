import { TUNING_PRESETS, DEFAULT_TUNING } from '../audio/tunings.js';
import { CustomDropdown } from './custom-dropdown.js';

export class TuningPanel {
  constructor(container) {
    this.container = container;
    this.currentTuning = DEFAULT_TUNING;
    this.currentFrequency = null;
    this.onTuningChange = null;
    this._build();
  }

  _build() {
    this.container.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'tuning-panel';

    // Header row: label + preset selector
    const header = document.createElement('div');
    header.className = 'tuning-header';

    const label = document.createElement('span');
    label.className = 'tuning-label';
    label.textContent = 'Tuning';
    header.appendChild(label);

    const dropdownWrap = document.createElement('div');
    dropdownWrap.className = 'tuning-select-wrap';

    this.presetDropdown = new CustomDropdown(dropdownWrap, {
      placeholder: 'Select tuning...',
    });

    // Group by family
    const families = {};
    for (const [key, preset] of Object.entries(TUNING_PRESETS)) {
      if (!families[preset.family]) families[preset.family] = [];
      families[preset.family].push({ key, preset });
    }

    const groups = [];
    for (const [family, items] of Object.entries(families)) {
      groups.push({
        label: family,
        items: items.map(({ key, preset }) => ({
          value: key,
          label: preset.label,
        })),
      });
    }

    this.presetDropdown.setGroupedItems(groups);
    this.presetDropdown.value = DEFAULT_TUNING;

    this.presetDropdown.onChange = (val) => {
      this.currentTuning = val;
      this._renderStrings();
      if (this.onTuningChange) this.onTuningChange(this.currentTuning);
    };

    header.appendChild(dropdownWrap);
    panel.appendChild(header);

    // String indicators container
    this.stringsContainer = document.createElement('div');
    this.stringsContainer.className = 'tuning-strings';
    panel.appendChild(this.stringsContainer);

    this.container.appendChild(panel);
    this._renderStrings();
  }

  _renderStrings() {
    const preset = TUNING_PRESETS[this.currentTuning];
    if (!preset) return;

    this.stringsContainer.innerHTML = '';
    this.stringEls = [];

    for (const str of preset.strings) {
      const el = document.createElement('div');
      el.className = 'tuning-string';

      const noteName = document.createElement('div');
      noteName.className = 'tuning-string-note';
      noteName.textContent = str.name;
      el.appendChild(noteName);

      const octave = document.createElement('div');
      octave.className = 'tuning-string-octave';
      octave.textContent = str.octave;
      el.appendChild(octave);

      const freq = document.createElement('div');
      freq.className = 'tuning-string-freq';
      freq.textContent = `${str.frequency.toFixed(1)} Hz`;
      el.appendChild(freq);

      const indicator = document.createElement('div');
      indicator.className = 'tuning-string-indicator';
      el.appendChild(indicator);

      this.stringsContainer.appendChild(el);
      this.stringEls.push({ el, indicator, frequency: str.frequency, note: str.name });
    }
  }

  update(detectedFreq) {
    this.currentFrequency = detectedFreq;
    const preset = TUNING_PRESETS[this.currentTuning];
    if (!preset || !this.stringEls) return;

    for (const s of this.stringEls) {
      s.el.classList.remove('active', 'in-tune', 'close', 'off');
      s.indicator.textContent = '';
    }

    if (!detectedFreq) return;

    // Find the closest string
    let closest = null;
    let closestCents = Infinity;
    for (const s of this.stringEls) {
      const cents = 1200 * Math.log2(detectedFreq / s.frequency);
      if (Math.abs(cents) < Math.abs(closestCents)) {
        closestCents = cents;
        closest = s;
      }
    }

    if (!closest || Math.abs(closestCents) > 100) return; // More than a semitone away, ignore

    closest.el.classList.add('active');
    const absCents = Math.abs(closestCents);
    if (absCents < 5) {
      closest.el.classList.add('in-tune');
      closest.indicator.textContent = '\u2713';
    } else if (absCents < 15) {
      closest.el.classList.add('close');
      closest.indicator.textContent = closestCents > 0 ? '\u2191' : '\u2193';
    } else {
      closest.el.classList.add('off');
      closest.indicator.textContent = closestCents > 0 ? '\u2191\u2191' : '\u2193\u2193';
    }
  }
}
