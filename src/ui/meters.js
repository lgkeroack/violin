const DB_MIN = -60;
const DB_MAX = 0;
const PEAK_HOLD_MS = 1500;
const PEAK_DECAY_DB_PER_SEC = 20;

export class LevelMeter {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d');
    this.peakHoldDb = DB_MIN;
    this.peakHoldTime = 0;
    this.lastPeakDb = DB_MIN;
  }

  draw(rmsDb, peakDb) {
    const now = performance.now();
    const ctx = this.canvasCtx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Update peak hold
    if (peakDb >= this.peakHoldDb) {
      this.peakHoldDb = peakDb;
      this.peakHoldTime = now;
    } else if (now - this.peakHoldTime > PEAK_HOLD_MS) {
      const elapsed = (now - this.peakHoldTime - PEAK_HOLD_MS) / 1000;
      this.peakHoldDb = Math.max(peakDb, this.peakHoldDb - PEAK_DECAY_DB_PER_SEC * elapsed);
    }

    // Clear
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, w, h);

    // Draw RMS bar
    const rmsNorm = this._dbToNorm(rmsDb);
    const barHeight = rmsNorm * h;
    const barY = h - barHeight;

    // Gradient: green -> yellow -> red
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, '#00e676');
    grad.addColorStop(0.6, '#00e676');
    grad.addColorStop(0.8, '#ffea00');
    grad.addColorStop(0.95, '#ff1744');
    grad.addColorStop(1, '#ff1744');

    ctx.fillStyle = grad;
    ctx.fillRect(2, barY, w - 4, barHeight);

    // Draw peak indicator line
    const peakNorm = this._dbToNorm(this.peakHoldDb);
    const peakY = h - peakNorm * h;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, peakY - 1, w - 2, 2);

    // Draw dB scale ticks
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (const db of [-6, -12, -24, -48]) {
      const norm = this._dbToNorm(db);
      const y = h - norm * h;
      ctx.fillRect(0, y, w, 1);
    }
  }

  _dbToNorm(db) {
    const clamped = Math.max(DB_MIN, Math.min(DB_MAX, db));
    return (clamped - DB_MIN) / (DB_MAX - DB_MIN);
  }
}
