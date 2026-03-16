import { CustomDropdown } from './custom-dropdown.js';
import { frequencyToMidi, frequencyToCents } from '../audio/note-utils.js';

/**
 * Scale Trainer — guided practice mode that sequences through scale notes,
 * detects when the player hits each target, and tracks accuracy.
 *
 * States: idle → playing → complete
 */
export class ScaleTrainer {
  constructor(container) {
    this.container = container;

    // Callbacks (set by main.js)
    this.onStart = null;          // () => sequence needed
    this.onTargetChange = null;   // (target) => void
    this.onHit = null;            // (target) => void
    this.onComplete = null;       // (stats) => void
    this.onStop = null;           // () => void

    // Config
    this._octaves = 1;
    this._direction = 'asc';
    this._tolerance = 20; // cents

    // State
    this._state = 'idle';   // idle | playing | complete
    this._sequence = [];
    this._currentIndex = 0;
    this._consecutiveHits = 0;
    this._hits = 0;
    this._misses = 0;
    this._centsSum = 0;
    this._centsCount = 0;
    this._wrongNoteFrames = 0;
    this._lastWrongMidi = -1;
    this._startTime = 0;

    this._build();
  }

  get active() {
    return this._state === 'playing';
  }

  get octaves() { return this._octaves; }
  get direction() { return this._direction; }
  get tolerance() { return this._tolerance; }

  _build() {
    this.container.replaceChildren();

    const panel = document.createElement('div');
    panel.className = 'trainer-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'trainer-header';
    const label = document.createElement('span');
    label.className = 'trainer-label';
    label.textContent = 'Scale Trainer';
    header.appendChild(label);
    panel.appendChild(header);

    // Config row
    const config = document.createElement('div');
    config.className = 'trainer-config';

    // Octaves dropdown
    const octItem = document.createElement('div');
    octItem.className = 'trainer-config-item';
    const octLabel = document.createElement('span');
    octLabel.className = 'trainer-config-label';
    octLabel.textContent = 'Octaves';
    octItem.appendChild(octLabel);
    const octWrap = document.createElement('div');
    octWrap.className = 'trainer-config-wrap trainer-config-wrap--small';
    this._octavesDropdown = new CustomDropdown(octWrap, { placeholder: '1' });
    this._octavesDropdown.setItems([
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
    ]);
    this._octavesDropdown.value = '1';
    this._octavesDropdown.onChange = (val) => { this._octaves = parseInt(val, 10); };
    octItem.appendChild(octWrap);
    config.appendChild(octItem);

    // Direction dropdown
    const dirItem = document.createElement('div');
    dirItem.className = 'trainer-config-item';
    const dirLabel = document.createElement('span');
    dirLabel.className = 'trainer-config-label';
    dirLabel.textContent = 'Direction';
    dirItem.appendChild(dirLabel);
    const dirWrap = document.createElement('div');
    dirWrap.className = 'trainer-config-wrap';
    this._directionDropdown = new CustomDropdown(dirWrap, { placeholder: 'Ascending' });
    this._directionDropdown.setItems([
      { value: 'asc', label: 'Ascending' },
      { value: 'desc', label: 'Descending' },
      { value: 'both', label: 'Both' },
    ]);
    this._directionDropdown.value = 'asc';
    this._directionDropdown.onChange = (val) => { this._direction = val; };
    dirItem.appendChild(dirWrap);
    config.appendChild(dirItem);

    // Tolerance dropdown
    const tolItem = document.createElement('div');
    tolItem.className = 'trainer-config-item';
    const tolLabel = document.createElement('span');
    tolLabel.className = 'trainer-config-label';
    tolLabel.textContent = 'Tolerance';
    tolItem.appendChild(tolLabel);
    const tolWrap = document.createElement('div');
    tolWrap.className = 'trainer-config-wrap';
    this._toleranceDropdown = new CustomDropdown(tolWrap, { placeholder: '20 cents' });
    this._toleranceDropdown.setItems([
      { value: '10', label: '10 cents' },
      { value: '20', label: '20 cents' },
      { value: '30', label: '30 cents' },
      { value: '50', label: '50 cents' },
    ]);
    this._toleranceDropdown.value = '20';
    this._toleranceDropdown.onChange = (val) => { this._tolerance = parseInt(val, 10); };
    tolItem.appendChild(tolWrap);
    config.appendChild(tolItem);

    panel.appendChild(config);

    // Button row
    const btnRow = document.createElement('div');
    btnRow.className = 'trainer-btn-row';

    this._startBtn = document.createElement('button');
    this._startBtn.className = 'trainer-start-btn';
    this._startBtn.textContent = 'Start Practice';
    this._startBtn.addEventListener('click', () => this._handleStart());
    btnRow.appendChild(this._startBtn);

    this._stopBtn = document.createElement('button');
    this._stopBtn.className = 'trainer-stop-btn trainer-hidden';
    this._stopBtn.textContent = 'Stop';
    this._stopBtn.addEventListener('click', () => this._handleStop());
    btnRow.appendChild(this._stopBtn);

    panel.appendChild(btnRow);

    // Progress bar
    this._progressRow = document.createElement('div');
    this._progressRow.className = 'trainer-progress trainer-hidden';

    const progressBar = document.createElement('div');
    progressBar.className = 'trainer-progress-bar';
    this._progressFill = document.createElement('div');
    this._progressFill.className = 'trainer-progress-fill';
    progressBar.appendChild(this._progressFill);
    this._progressRow.appendChild(progressBar);

    this._progressText = document.createElement('span');
    this._progressText.className = 'trainer-progress-text';
    this._progressRow.appendChild(this._progressText);

    panel.appendChild(this._progressRow);

    // Target display
    this._targetDisplay = document.createElement('div');
    this._targetDisplay.className = 'trainer-target-display trainer-hidden';

    this._targetNote = document.createElement('div');
    this._targetNote.className = 'trainer-target-note';
    this._targetDisplay.appendChild(this._targetNote);

    this._targetInstruction = document.createElement('div');
    this._targetInstruction.className = 'trainer-target-instruction';
    this._targetInstruction.textContent = 'Play this note';
    this._targetDisplay.appendChild(this._targetInstruction);

    panel.appendChild(this._targetDisplay);

    // Stats row
    this._statsRow = document.createElement('div');
    this._statsRow.className = 'trainer-stats trainer-hidden';

    this._hitsStat = this._createStat('0', 'Hits', 'hits');
    this._missesStat = this._createStat('0', 'Misses', 'misses');
    this._accuracyStat = this._createStat('-', 'Accuracy', '');
    this._centsStat = this._createStat('-', 'Avg Cents', '');

    this._statsRow.appendChild(this._hitsStat.el);
    this._statsRow.appendChild(this._missesStat.el);
    this._statsRow.appendChild(this._accuracyStat.el);
    this._statsRow.appendChild(this._centsStat.el);

    panel.appendChild(this._statsRow);

    // Summary (shown on completion)
    this._summaryEl = document.createElement('div');
    this._summaryEl.className = 'trainer-summary trainer-hidden';
    panel.appendChild(this._summaryEl);

    this.container.appendChild(panel);
  }

  _createStat(value, label, valueClass) {
    const el = document.createElement('div');
    el.className = 'trainer-stat';
    const valEl = document.createElement('div');
    valEl.className = 'trainer-stat-value' + (valueClass ? ` ${valueClass}` : '');
    valEl.textContent = value;
    el.appendChild(valEl);
    const labEl = document.createElement('div');
    labEl.className = 'trainer-stat-label';
    labEl.textContent = label;
    el.appendChild(labEl);
    return { el, valEl };
  }

  _handleStart() {
    if (this._state === 'complete') {
      // Restart
      this._summaryEl.classList.add('trainer-hidden');
    }
    // Notify main.js to generate sequence and call beginSession
    this.onStart?.();
  }

  _handleStop() {
    this._state = 'idle';
    this._updateUI();
    this.onStop?.();
  }

  /**
   * Called by main.js after generating the sequence.
   */
  beginSession(sequence) {
    if (!sequence || sequence.length === 0) return;

    this._sequence = sequence;
    this._currentIndex = 0;
    this._consecutiveHits = 0;
    this._hits = 0;
    this._misses = 0;
    this._centsSum = 0;
    this._centsCount = 0;
    this._wrongNoteFrames = 0;
    this._lastWrongMidi = -1;
    this._startTime = performance.now();
    this._state = 'playing';

    this._updateUI();
    this._emitTarget();
  }

  /**
   * Called every frame from the render loop with the detected frequency.
   */
  update(freq) {
    if (this._state !== 'playing') return;

    const target = this._sequence[this._currentIndex];
    if (!target) return;

    if (!freq || freq < 20) {
      this._consecutiveHits = 0;
      return;
    }

    const midi = frequencyToMidi(freq);
    const cents = frequencyToCents(freq);

    if (midi === target.midi && Math.abs(cents) <= this._tolerance) {
      this._consecutiveHits++;
      if (this._consecutiveHits >= 3) {
        // Hit!
        this._hits++;
        this._centsSum += Math.abs(cents);
        this._centsCount++;
        this.onHit?.(target);
        this._advance();
      }
    } else {
      this._consecutiveHits = 0;

      // Track wrong note frames for miss detection
      if (midi !== target.midi && freq > 20) {
        if (midi === this._lastWrongMidi) {
          this._wrongNoteFrames++;
          if (this._wrongNoteFrames >= 5) {
            this._misses++;
            this._wrongNoteFrames = 0;
            this._lastWrongMidi = -1;
            this._updateStats();
          }
        } else {
          this._lastWrongMidi = midi;
          this._wrongNoteFrames = 1;
        }
      }
    }
  }

  _advance() {
    this._currentIndex++;
    this._consecutiveHits = 0;
    this._wrongNoteFrames = 0;
    this._lastWrongMidi = -1;

    if (this._currentIndex >= this._sequence.length) {
      this._state = 'complete';
      this._updateUI();
      this._showSummary();
      this.onComplete?.({
        hits: this._hits,
        misses: this._misses,
        accuracy: this._getAccuracy(),
        avgCents: this._getAvgCents(),
        elapsed: performance.now() - this._startTime,
      });
      this.onStop?.();
    } else {
      this._updateStats();
      this._updateProgress();
      this._emitTarget();
    }
  }

  _emitTarget() {
    if (this._currentIndex >= this._sequence.length) return;
    const target = this._sequence[this._currentIndex];
    if (target) {
      this._targetNote.textContent = '';
      this._targetNote.appendChild(document.createTextNode(target.noteName));
      const octSpan = document.createElement('span');
      octSpan.className = 'octave';
      octSpan.textContent = target.octave;
      this._targetNote.appendChild(octSpan);
      this.onTargetChange?.(target);
    }
  }

  _getAccuracy() {
    const total = this._hits + this._misses;
    if (total === 0) return 0;
    return Math.round((this._hits / total) * 100);
  }

  _getAvgCents() {
    if (this._centsCount === 0) return 0;
    return (this._centsSum / this._centsCount).toFixed(1);
  }

  _updateStats() {
    this._hitsStat.valEl.textContent = this._hits;
    this._missesStat.valEl.textContent = this._misses;

    const total = this._hits + this._misses;
    this._accuracyStat.valEl.textContent = total > 0 ? `${this._getAccuracy()}%` : '-';
    this._centsStat.valEl.textContent = this._centsCount > 0
      ? `${this._getAvgCents()}c` : '-';
  }

  _updateProgress() {
    const total = this._sequence.length;
    const current = this._currentIndex;
    const pct = total > 0 ? (current / total) * 100 : 0;
    this._progressFill.style.width = `${pct}%`;
    this._progressText.textContent = `${current} / ${total}`;
  }

  _updateUI() {
    const idle = this._state === 'idle';
    const playing = this._state === 'playing';
    const complete = this._state === 'complete';

    // Config dropdowns
    // (they remain accessible but changing mid-session has no effect)

    // Buttons
    this._startBtn.textContent = complete ? 'Restart' : 'Start Practice';
    this._startBtn.classList.toggle('trainer-hidden', playing);
    this._stopBtn.classList.toggle('trainer-hidden', !playing);

    // Progress
    this._progressRow.classList.toggle('trainer-hidden', idle);
    if (playing) this._updateProgress();
    if (complete) {
      this._progressFill.style.width = '100%';
      this._progressText.textContent = `${this._sequence.length} / ${this._sequence.length}`;
    }

    // Target display
    this._targetDisplay.classList.toggle('trainer-hidden', !playing);

    // Stats
    this._statsRow.classList.toggle('trainer-hidden', idle);
    if (playing || complete) this._updateStats();

    // Summary
    if (!complete) this._summaryEl.classList.add('trainer-hidden');
  }

  _showSummary() {
    const elapsed = performance.now() - this._startTime;
    const seconds = Math.round(elapsed / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    this._summaryEl.replaceChildren();
    this._summaryEl.classList.remove('trainer-hidden');

    const title = document.createElement('div');
    title.className = 'trainer-summary-title';
    title.textContent = 'Practice Complete!';
    this._summaryEl.appendChild(title);

    const stats = document.createElement('div');
    stats.className = 'trainer-summary-stats';

    const items = [
      { value: `${this._getAccuracy()}%`, label: 'Accuracy' },
      { value: `${this._getAvgCents()}c`, label: 'Avg Deviation' },
      { value: `${this._hits}`, label: 'Hits' },
      { value: `${this._misses}`, label: 'Misses' },
      { value: timeStr, label: 'Time' },
    ];

    for (const item of items) {
      const el = document.createElement('div');
      el.className = 'trainer-summary-stat';
      const val = document.createElement('div');
      val.className = 'trainer-summary-stat-value';
      val.textContent = item.value;
      el.appendChild(val);
      const lab = document.createElement('div');
      lab.className = 'trainer-summary-stat-label';
      lab.textContent = item.label;
      el.appendChild(lab);
      stats.appendChild(el);
    }

    this._summaryEl.appendChild(stats);
  }
}
