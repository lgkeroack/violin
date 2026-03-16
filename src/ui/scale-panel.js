import { CustomDropdown } from './custom-dropdown.js';
import { SCALES, ROOT_NOTES, INSTRUMENT_FAMILIES, getScaleNotes, getDifficultyLabel } from '../audio/scales.js';

const DIFFICULTY_DOTS = [
  '',
  '\u25CF',
  '\u25CF\u25CF',
  '\u25CF\u25CF\u25CF',
  '\u25CF\u25CF\u25CF\u25CF',
  '\u25CF\u25CF\u25CF\u25CF\u25CF',
];

export class ScalePanel {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.onScaleChange = null; // ({ pitchClasses, root } | null) => void
    this._rootPitchClass = 0; // C
    this._scaleKey = '';       // empty = off
    this._instrumentFilter = ''; // empty = all
    this._build();
  }

  get scaleKey() { return this._scaleKey; }
  get rootPitchClass() { return this._rootPitchClass; }

  _build() {
    this.container.replaceChildren();

    const panel = document.createElement('div');
    panel.className = 'scale-panel';

    // --- Top row: label, root, instrument filter ---
    const header = document.createElement('div');
    header.className = 'scale-header';

    const label = document.createElement('span');
    label.className = 'scale-label';
    label.textContent = 'Scale';
    header.appendChild(label);

    // Root note dropdown
    const rootWrap = document.createElement('div');
    rootWrap.className = 'scale-root-wrap';
    this._rootDropdown = new CustomDropdown(rootWrap, { placeholder: 'Root' });
    this._rootDropdown.setItems(ROOT_NOTES);
    this._rootDropdown.value = '0'; // C
    this._rootDropdown.onChange = (val) => {
      this._rootPitchClass = parseInt(val, 10);
      this._emitChange();
    };
    header.appendChild(rootWrap);

    // Instrument filter dropdown
    const instWrap = document.createElement('div');
    instWrap.className = 'scale-inst-wrap';
    this._instDropdown = new CustomDropdown(instWrap, { placeholder: 'All instruments' });
    this._instDropdown.setItems([
      { value: '', label: 'All instruments' },
      ...INSTRUMENT_FAMILIES.map(f => ({ value: f, label: f })),
    ]);
    this._instDropdown.value = '';
    this._instDropdown.onChange = (val) => {
      this._instrumentFilter = val;
      this._rebuildScaleDropdown();
    };
    header.appendChild(instWrap);

    panel.appendChild(header);

    // --- Second row: scale type + difficulty badge ---
    const scaleRow = document.createElement('div');
    scaleRow.className = 'scale-row';

    const scaleWrap = document.createElement('div');
    scaleWrap.className = 'scale-type-wrap';
    this._scaleDropdown = new CustomDropdown(scaleWrap, { placeholder: 'Off' });
    scaleRow.appendChild(scaleWrap);

    this._diffBadge = document.createElement('span');
    this._diffBadge.className = 'scale-difficulty';
    scaleRow.appendChild(this._diffBadge);

    this._scaleDropdown.onChange = (val) => {
      this._scaleKey = val;
      this._updateDiffBadge();
      this._emitChange();
    };

    panel.appendChild(scaleRow);
    this.container.appendChild(panel);

    this._rebuildScaleDropdown();
  }

  _rebuildScaleDropdown() {
    const prev = this._scaleKey;

    const items = [{ value: '', label: 'Off' }];
    for (const [key, s] of Object.entries(SCALES)) {
      if (this._instrumentFilter && !s.instruments.includes(this._instrumentFilter)) continue;
      const dots = DIFFICULTY_DOTS[s.difficulty] || '';
      items.push({
        value: key,
        label: `${s.label}  ${dots}`,
      });
    }

    this._scaleDropdown.setItems(items);

    // Restore selection if still in filtered list, otherwise reset to Off
    if (items.some(i => i.value === prev)) {
      this._scaleDropdown.value = prev;
      this._scaleKey = prev;
    } else {
      this._scaleDropdown.value = '';
      this._scaleKey = '';
    }

    this._updateDiffBadge();
    this._emitChange();
  }

  _updateDiffBadge() {
    const scale = SCALES[this._scaleKey];
    if (!scale) {
      this._diffBadge.textContent = '';
      this._diffBadge.className = 'scale-difficulty';
      return;
    }
    const label = getDifficultyLabel(scale.difficulty);
    this._diffBadge.textContent = label;
    this._diffBadge.className = 'scale-difficulty';
    this._diffBadge.classList.add(`diff-${scale.difficulty}`);
  }

  _emitChange() {
    if (!this._scaleKey) {
      this.onScaleChange?.(null);
      return;
    }
    const result = getScaleNotes(this._rootPitchClass, this._scaleKey);
    this.onScaleChange?.(result);
  }
}
