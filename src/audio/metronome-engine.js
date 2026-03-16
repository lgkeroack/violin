/**
 * Web Audio metronome using the lookahead scheduler pattern.
 * Schedules OscillatorNode bursts at precise audioContext.currentTime offsets.
 * Routes to ctx.destination directly (NOT through mixBus) to avoid
 * corrupting pitch detection.
 */
export class MetronomeEngine {
  /**
   * @param {AudioContext} ctx
   */
  constructor(ctx) {
    this.ctx = ctx;

    // Settings
    this.bpm = 120;
    this.beatsPerMeasure = 4; // numerator of time signature
    this.volume = 0.5;

    // State
    this._playing = false;
    this._currentBeat = 0;
    this._nextNoteTime = 0;
    this._timerId = null;

    // Lookahead config
    this._scheduleAheadTime = 0.1; // seconds to look ahead
    this._lookaheadMs = 25;        // how often to wake scheduler (ms)

    // Output gain (not on mixBus)
    this._gainNode = this.ctx.createGain();
    this._gainNode.gain.value = this.volume;
    this._gainNode.connect(this.ctx.destination);

    // Beat callback
    this.onBeat = null; // (beatIndex: number, time: number) => void
  }

  get playing() {
    return this._playing;
  }

  start() {
    if (this._playing) return;
    this._playing = true;
    this._currentBeat = 0;
    this._nextNoteTime = this.ctx.currentTime;
    this._schedule();
    this._timerId = setInterval(() => this._schedule(), this._lookaheadMs);
  }

  stop() {
    if (!this._playing) return;
    this._playing = false;
    if (this._timerId !== null) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  setVolume(val) {
    this.volume = val;
    this._gainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.01);
  }

  _schedule() {
    while (this._nextNoteTime < this.ctx.currentTime + this._scheduleAheadTime) {
      this._scheduleBeat(this._currentBeat, this._nextNoteTime);
      this._advanceBeat();
    }
  }

  _scheduleBeat(beatIndex, time) {
    const isAccent = beatIndex === 0;
    const freq = isAccent ? 1000 : 800;
    const duration = 0.06; // 60ms burst

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(isAccent ? 1.0 : 0.7, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(env);
    env.connect(this._gainNode);

    osc.start(time);
    osc.stop(time + duration);

    // Fire beat callback (used for visual indicator)
    this.onBeat?.(beatIndex, time);
  }

  _advanceBeat() {
    const secondsPerBeat = 60.0 / this.bpm;
    this._nextNoteTime += secondsPerBeat;
    this._currentBeat = (this._currentBeat + 1) % this.beatsPerMeasure;
  }

  destroy() {
    this.stop();
    this._gainNode.disconnect();
  }
}
