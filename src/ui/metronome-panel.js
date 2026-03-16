import { CustomDropdown } from './custom-dropdown.js';

const TIME_SIGNATURES = [
  { value: '2/4',  label: '2/4',  beats: 2 },
  { value: '3/4',  label: '3/4',  beats: 3 },
  { value: '4/4',  label: '4/4',  beats: 4 },
  { value: '5/4',  label: '5/4',  beats: 5 },
  { value: '6/8',  label: '6/8',  beats: 6 },
  { value: '7/8',  label: '7/8',  beats: 7 },
  { value: '9/8',  label: '9/8',  beats: 9 },
  { value: '12/8', label: '12/8', beats: 12 },
];

export class MetronomePanel {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.onStart = null;   // () => void
    this.onStop = null;    // () => void
    this.onBpmChange = null;    // (bpm: number) => void
    this.onTimeSigChange = null; // (beats: number) => void
    this.onVolumeChange = null;  // (vol: number) => void

    this._bpm = 120;
    this._beats = 4;
    this._playing = false;
    this._beatDots = [];

    this._build();
  }

  get bpm() { return this._bpm; }
  get beats() { return this._beats; }

  _build() {
    this.container.replaceChildren();

    const panel = document.createElement('div');
    panel.className = 'metronome-panel';

    // --- Header row ---
    const header = document.createElement('div');
    header.className = 'metronome-header';

    const label = document.createElement('span');
    label.className = 'metronome-label';
    label.textContent = 'Metronome';
    header.appendChild(label);

    // Play/stop toggle
    this._playBtn = document.createElement('button');
    this._playBtn.className = 'metronome-play-btn';
    this._playBtn.textContent = '\u25B6'; // play triangle
    this._playBtn.title = 'Start / Stop';
    this._playBtn.addEventListener('click', () => {
      if (this._playing) {
        this._playing = false;
        this._playBtn.textContent = '\u25B6';
        this._playBtn.classList.remove('active');
        this._clearBeatDots();
        this.onStop?.();
      } else {
        this._playing = true;
        this._playBtn.textContent = '\u25A0'; // stop square
        this._playBtn.classList.add('active');
        this.onStart?.();
      }
    });
    header.appendChild(this._playBtn);

    panel.appendChild(header);

    // --- Controls row ---
    const controls = document.createElement('div');
    controls.className = 'metronome-controls';

    // BPM: minus button, slider, editable display, plus button
    const bpmGroup = document.createElement('div');
    bpmGroup.className = 'metronome-bpm-group';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'metronome-bpm-btn';
    minusBtn.textContent = '\u2212';
    minusBtn.addEventListener('click', () => this._setBpm(this._bpm - 1));
    bpmGroup.appendChild(minusBtn);

    this._bpmSlider = document.createElement('input');
    this._bpmSlider.type = 'range';
    this._bpmSlider.className = 'metronome-bpm-slider';
    this._bpmSlider.min = '40';
    this._bpmSlider.max = '220';
    this._bpmSlider.value = String(this._bpm);
    this._bpmSlider.addEventListener('input', () => {
      this._setBpm(parseInt(this._bpmSlider.value, 10));
    });
    bpmGroup.appendChild(this._bpmSlider);

    this._bpmDisplay = document.createElement('input');
    this._bpmDisplay.type = 'text';
    this._bpmDisplay.className = 'metronome-bpm-display';
    this._bpmDisplay.value = String(this._bpm);
    this._bpmDisplay.addEventListener('change', () => {
      const val = parseInt(this._bpmDisplay.value, 10);
      if (!isNaN(val)) this._setBpm(val);
      else this._bpmDisplay.value = String(this._bpm);
    });
    this._bpmDisplay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._bpmDisplay.blur();
    });
    bpmGroup.appendChild(this._bpmDisplay);

    const bpmUnit = document.createElement('span');
    bpmUnit.className = 'metronome-bpm-unit';
    bpmUnit.textContent = 'BPM';
    bpmGroup.appendChild(bpmUnit);

    const plusBtn = document.createElement('button');
    plusBtn.className = 'metronome-bpm-btn';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => this._setBpm(this._bpm + 1));
    bpmGroup.appendChild(plusBtn);

    controls.appendChild(bpmGroup);

    // Time signature dropdown
    const timeSigWrap = document.createElement('div');
    timeSigWrap.className = 'metronome-timesig-wrap';
    this._timeSigDropdown = new CustomDropdown(timeSigWrap, { placeholder: '4/4' });
    this._timeSigDropdown.setItems(TIME_SIGNATURES.map(ts => ({ value: ts.value, label: ts.label })));
    this._timeSigDropdown.value = '4/4';
    this._timeSigDropdown.onChange = (val) => {
      const ts = TIME_SIGNATURES.find(t => t.value === val);
      if (ts) {
        this._beats = ts.beats;
        this._buildBeatDots();
        this.onTimeSigChange?.(ts.beats);
      }
    };
    controls.appendChild(timeSigWrap);

    // Volume slider
    const volGroup = document.createElement('div');
    volGroup.className = 'metronome-vol-group';

    const volIcon = document.createElement('span');
    volIcon.className = 'metronome-vol-icon';
    volIcon.textContent = '\uD83D\uDD0A'; // speaker emoji
    volGroup.appendChild(volIcon);

    this._volSlider = document.createElement('input');
    this._volSlider.type = 'range';
    this._volSlider.className = 'metronome-vol-slider';
    this._volSlider.min = '0';
    this._volSlider.max = '1';
    this._volSlider.step = '0.01';
    this._volSlider.value = '0.5';
    this._volSlider.addEventListener('input', () => {
      this.onVolumeChange?.(parseFloat(this._volSlider.value));
    });
    volGroup.appendChild(this._volSlider);

    controls.appendChild(volGroup);

    panel.appendChild(controls);

    // --- Beat indicators ---
    this._beatContainer = document.createElement('div');
    this._beatContainer.className = 'metronome-beats';
    panel.appendChild(this._beatContainer);

    this.container.appendChild(panel);
    this._buildBeatDots();
  }

  _setBpm(val) {
    this._bpm = Math.max(40, Math.min(220, val));
    this._bpmSlider.value = String(this._bpm);
    this._bpmDisplay.value = String(this._bpm);
    this.onBpmChange?.(this._bpm);
  }

  _buildBeatDots() {
    this._beatContainer.replaceChildren();
    this._beatDots = [];
    for (let i = 0; i < this._beats; i++) {
      const dot = document.createElement('span');
      dot.className = 'metronome-beat-dot';
      if (i === 0) dot.classList.add('accent');
      this._beatContainer.appendChild(dot);
      this._beatDots.push(dot);
    }
  }

  _clearBeatDots() {
    for (const dot of this._beatDots) {
      dot.classList.remove('lit');
    }
  }

  /** Called by main to flash the beat indicator */
  flashBeat(beatIndex) {
    this._clearBeatDots();
    if (beatIndex >= 0 && beatIndex < this._beatDots.length) {
      this._beatDots[beatIndex].classList.add('lit');
    }
  }
}
