/**
 * YIN pitch detection algorithm.
 * Reference: de Cheveigné & Kawahara (2002)
 */

const YIN_THRESHOLD = 0.15;

export class PitchDetector {
  constructor() {
    this._yinBuffer = null;
  }

  /**
   * Detect pitch from float time-domain audio data.
   * Returns frequency in Hz, or null if no clear pitch.
   */
  detect(data, sampleRate) {
    const halfLen = Math.floor(data.length / 2);

    // Reuse buffer
    if (!this._yinBuffer || this._yinBuffer.length !== halfLen) {
      this._yinBuffer = new Float32Array(halfLen);
    }
    const yinBuffer = this._yinBuffer;

    // Step 1: Squared difference function
    yinBuffer[0] = 0;
    for (let tau = 1; tau < halfLen; tau++) {
      yinBuffer[tau] = 0;
      for (let i = 0; i < halfLen; i++) {
        const diff = data[i] - data[i + tau];
        yinBuffer[tau] += diff * diff;
      }
    }

    // Step 2: Cumulative mean normalized difference
    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < halfLen; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / runningSum;
    }

    // Step 3: Absolute threshold - find first dip below threshold
    let tauEstimate = -1;
    for (let tau = 2; tau < halfLen; tau++) {
      if (yinBuffer[tau] < YIN_THRESHOLD) {
        // Walk to the local minimum
        while (tau + 1 < halfLen && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        tauEstimate = tau;
        break;
      }
    }

    if (tauEstimate === -1) return null;

    // Step 4: Parabolic interpolation for sub-sample accuracy
    const t = tauEstimate;
    let betterTau;
    if (t > 0 && t < halfLen - 1) {
      const s0 = yinBuffer[t - 1];
      const s1 = yinBuffer[t];
      const s2 = yinBuffer[t + 1];
      const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
      betterTau = t + (isFinite(adjustment) ? adjustment : 0);
    } else {
      betterTau = t;
    }

    const frequency = sampleRate / betterTau;

    // Sanity check: violin range roughly G3 (196Hz) to E7 (2637Hz),
    // but allow wider for harmonics and other instruments
    if (frequency < 50 || frequency > 5000) return null;

    return frequency;
  }
}
