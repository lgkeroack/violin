let nextId = 1;

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.mixBus = null;
    this.pitchAnalyser = null;
    this.bridgeNode = null; // MediaStreamDestination for secondary outputs

    /** @type {Map<number, InputChannel>} */
    this.inputs = new Map();
    /** @type {Map<number, OutputChannel>} */
    this.outputs = new Map();
  }

  async init() {
    this.ctx = new AudioContext({
      latencyHint: 'interactive',
    });

    // Mix bus — all inputs merge here
    this.mixBus = this.ctx.createGain();

    // Pitch analyser on the mixed signal
    this.pitchAnalyser = this.ctx.createAnalyser();
    this.pitchAnalyser.fftSize = 4096;
    this.pitchAnalyser.smoothingTimeConstant = 0;
    this.mixBus.connect(this.pitchAnalyser);

    // Bridge for secondary outputs (MediaStream that can be fed to other AudioContexts)
    this.bridgeNode = this.ctx.createMediaStreamDestination();
    this.mixBus.connect(this.bridgeNode);

    return this.ctx;
  }

  // --- Input channels ---

  /**
   * Create an input channel (no stream yet). Returns channelId.
   * Call connectInputStream() to attach audio.
   */
  createInput() {
    const id = nextId++;
    const gain = this.ctx.createGain();
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    gain.connect(analyser);
    gain.connect(this.mixBus);

    this.inputs.set(id, {
      id,
      stream: null,
      source: null,
      gain,
      analyser,
      muted: false,
      gainValue: 1.0,
    });
    return id;
  }

  /**
   * Attach a MediaStream to an existing input channel.
   */
  connectInputStream(channelId, stream) {
    const ch = this.inputs.get(channelId);
    if (!ch) return;

    // Disconnect old source if any
    if (ch.source) {
      ch.source.disconnect();
    }
    if (ch.stream) {
      ch.stream.getTracks().forEach(t => t.stop());
    }

    const source = this.ctx.createMediaStreamSource(stream);
    source.connect(ch.gain);
    ch.source = source;
    ch.stream = stream;
  }

  /**
   * Remove an input channel. Stops its stream and disconnects nodes.
   */
  removeInput(channelId) {
    const ch = this.inputs.get(channelId);
    if (!ch) return;
    ch.source.disconnect();
    ch.gain.disconnect();
    ch.stream.getTracks().forEach(t => t.stop());
    this.inputs.delete(channelId);
  }

  /**
   * Switch the device for an existing input channel.
   * Delegates to connectInputStream.
   */
  switchInputDevice(channelId, stream) {
    this.connectInputStream(channelId, stream);
  }

  setInputGain(channelId, value) {
    const ch = this.inputs.get(channelId);
    if (!ch) return;
    ch.gainValue = value;
    if (!ch.muted) {
      ch.gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.01);
    }
  }

  toggleInputMute(channelId) {
    const ch = this.inputs.get(channelId);
    if (!ch) return false;
    ch.muted = !ch.muted;
    const value = ch.muted ? 0 : ch.gainValue;
    ch.gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.01);
    return ch.muted;
  }

  getInputLevel(channelId) {
    const ch = this.inputs.get(channelId);
    if (!ch) return { rms: 0, peak: 0, rmsDb: -100, peakDb: -100 };
    return this._getLevel(ch.analyser);
  }

  // --- Output channels ---

  /**
   * Add an output channel.
   * The first output uses the primary AudioContext (zero bridge latency).
   * Additional outputs each get their own AudioContext with setSinkId.
   * @param {string} deviceId
   * @returns {Promise<number>} channelId
   */
  async addOutput(deviceId) {
    const id = nextId++;
    const isPrimary = this.outputs.size === 0;

    if (isPrimary) {
      // Primary output: route mixBus directly to ctx.destination
      this.mixBus.connect(this.ctx.destination);
      if (this.ctx.setSinkId && deviceId) {
        await this.ctx.setSinkId(deviceId);
      }

      const analyser = this.ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      this.mixBus.connect(analyser);

      this.outputs.set(id, {
        id,
        deviceId,
        primary: true,
        ctx: this.ctx,
        gain: null, // primary uses mixBus level
        analyser,
        outputGain: this.ctx.createGain(),
        muted: false,
        gainValue: 1.0,
      });

      // Wire output gain for primary (between mixBus and destination)
      // Rewire: mixBus -> outputGain -> destination, mixBus -> analyser
      this.mixBus.disconnect(this.ctx.destination);
      const outGain = this.outputs.get(id).outputGain;
      this.mixBus.connect(outGain);
      outGain.connect(this.ctx.destination);
      // Analyser taps after gain
      outGain.connect(analyser);
      // Disconnect the direct mixBus->analyser we set up above
      this.mixBus.disconnect(analyser);
    } else {
      // Secondary output: separate AudioContext
      if (this.outputs.size >= 4) return -1; // cap at 4 outputs

      const outCtx = new AudioContext({
        latencyHint: 'interactive',
      });
      if (outCtx.setSinkId && deviceId) {
        await outCtx.setSinkId(deviceId);
      }

      const bridgeSource = outCtx.createMediaStreamSource(this.bridgeNode.stream);
      const outGain = outCtx.createGain();
      const analyser = outCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      bridgeSource.connect(outGain);
      outGain.connect(analyser);
      outGain.connect(outCtx.destination);

      this.outputs.set(id, {
        id,
        deviceId,
        primary: false,
        ctx: outCtx,
        bridgeSource,
        gain: outGain,
        analyser,
        outputGain: outGain,
        muted: false,
        gainValue: 1.0,
      });
    }
    return id;
  }

  /**
   * Remove an output channel.
   */
  removeOutput(channelId) {
    const ch = this.outputs.get(channelId);
    if (!ch) return;

    if (ch.primary) {
      // Disconnect primary routing
      ch.outputGain.disconnect();
      this.mixBus.disconnect(ch.outputGain);
      this.mixBus.disconnect(ch.analyser);
    } else {
      ch.bridgeSource.disconnect();
      ch.outputGain.disconnect();
      ch.ctx.close();
    }
    this.outputs.delete(channelId);
  }

  /**
   * Switch the device for an existing output channel.
   */
  async switchOutputDevice(channelId, deviceId) {
    const ch = this.outputs.get(channelId);
    if (!ch) return;
    ch.deviceId = deviceId;
    if (ch.ctx.setSinkId) {
      await ch.ctx.setSinkId(deviceId);
    }
  }

  setOutputGain(channelId, value) {
    const ch = this.outputs.get(channelId);
    if (!ch) return;
    ch.gainValue = value;
    if (!ch.muted) {
      ch.outputGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.01);
    }
  }

  toggleOutputMute(channelId) {
    const ch = this.outputs.get(channelId);
    if (!ch) return false;
    ch.muted = !ch.muted;
    const value = ch.muted ? 0 : ch.gainValue;
    ch.outputGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.01);
    return ch.muted;
  }

  getOutputLevel(channelId) {
    const ch = this.outputs.get(channelId);
    if (!ch) return { rms: 0, peak: 0, rmsDb: -100, peakDb: -100 };
    return this._getLevel(ch.analyser);
  }

  // --- Shared ---

  _getLevel(analyser) {
    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);

    let sum = 0;
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      sum += data[i] * data[i];
      if (abs > peak) peak = abs;
    }
    const rms = Math.sqrt(sum / data.length);

    const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -100;
    const peakDb = peak > 0 ? 20 * Math.log10(peak) : -100;

    return { rms, peak, rmsDb, peakDb };
  }

  getPitchData() {
    const bufferLength = this.pitchAnalyser.fftSize;
    const data = new Float32Array(bufferLength);
    this.pitchAnalyser.getFloatTimeDomainData(data);
    return { data, sampleRate: this.ctx.sampleRate };
  }

  getLatency() {
    const base = this.ctx.baseLatency || 0;
    const output = this.ctx.outputLatency || 0;
    return (base + output) * 1000; // ms
  }

  /** Estimated bridge latency for secondary outputs */
  getBridgeLatency() {
    // ~128 samples at 48kHz = ~2.67ms per bridge hop
    return 128 / (this.ctx?.sampleRate || 48000) * 1000;
  }

  destroy() {
    for (const [id] of this.inputs) {
      this.removeInput(id);
    }
    for (const [id, ch] of this.outputs) {
      if (!ch.primary) ch.ctx.close();
    }
    this.outputs.clear();
    if (this.ctx) {
      this.ctx.close();
    }
  }
}
