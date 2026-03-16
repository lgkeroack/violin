import { DeviceSelector } from './device-selector.js';
import { CustomDropdown } from './custom-dropdown.js';

export class MixerPanel {
  constructor(container) {
    this.container = container;

    // Callbacks: all receive channelId as first arg
    this.onAddInput = null;       // () => void
    this.onRemoveInput = null;    // (channelId) => void
    this.onAddOutput = null;      // () => void
    this.onRemoveOutput = null;   // (channelId) => void
    this.onInputDeviceChange = null;  // (channelId, deviceId) => void
    this.onOutputDeviceChange = null; // (channelId, deviceId) => void
    this.onInputGainChange = null;    // (channelId, value) => void
    this.onOutputGainChange = null;   // (channelId, value) => void
    this.onInputMuteToggle = null;    // (channelId) => void
    this.onOutputMuteToggle = null;   // (channelId) => void
    this.onBufferSizeChange = null;   // (samples|null) => void

    /** @type {Map<number, StripState>} */
    this.inputStrips = new Map();
    /** @type {Map<number, StripState>} */
    this.outputStrips = new Map();

    this.devices = { inputs: [], outputs: [] };

    this._build();
  }

  _build() {
    this.container.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'mixer-panel';

    // --- Inputs section ---
    const inputSection = document.createElement('div');
    inputSection.className = 'mixer-section';

    const inputHeader = document.createElement('div');
    inputHeader.className = 'section-header';

    const inputTitle = document.createElement('span');
    inputTitle.className = 'section-title section-title--input';
    inputTitle.textContent = 'Inputs';
    inputHeader.appendChild(inputTitle);

    this.addInputBtn = document.createElement('button');
    this.addInputBtn.className = 'add-strip-btn';
    this.addInputBtn.textContent = '+ Add Input';
    this.addInputBtn.addEventListener('click', () => this.onAddInput?.());
    inputHeader.appendChild(this.addInputBtn);

    this.inputStripContainer = document.createElement('div');
    this.inputStripContainer.className = 'strip-group';

    inputSection.appendChild(inputHeader);
    inputSection.appendChild(this.inputStripContainer);

    // --- Routing divider ---
    const routing = document.createElement('div');
    routing.className = 'routing-visual';

    const routingLine = document.createElement('div');
    routingLine.className = 'routing-line';
    routing.appendChild(routingLine);

    const routingInfo = document.createElement('div');
    routingInfo.className = 'routing-info';

    const arrow = document.createElement('span');
    arrow.className = 'routing-arrow';
    arrow.textContent = '\u2192';
    routingInfo.appendChild(arrow);

    this._latencyWrap = document.createElement('div');
    this._latencyWrap.className = 'latency-wrap';

    this.latencyEl = document.createElement('span');
    this.latencyEl.className = 'routing-latency';
    this._latencyWrap.appendChild(this.latencyEl);

    this._latencyTooltip = document.createElement('div');
    this._latencyTooltip.className = 'latency-tooltip';
    this._latencyWrap.appendChild(this._latencyTooltip);

    routingInfo.appendChild(this._latencyWrap);

    const arrow2 = document.createElement('span');
    arrow2.className = 'routing-arrow';
    arrow2.textContent = '\u2192';
    routingInfo.appendChild(arrow2);

    routing.appendChild(routingInfo);

    const routingLine2 = document.createElement('div');
    routingLine2.className = 'routing-line';
    routing.appendChild(routingLine2);

    // --- Outputs section ---
    const outputSection = document.createElement('div');
    outputSection.className = 'mixer-section';

    const outputHeader = document.createElement('div');
    outputHeader.className = 'section-header';

    const outputTitle = document.createElement('span');
    outputTitle.className = 'section-title section-title--output';
    outputTitle.textContent = 'Outputs';
    outputHeader.appendChild(outputTitle);

    this.addOutputBtn = document.createElement('button');
    this.addOutputBtn.className = 'add-strip-btn';
    this.addOutputBtn.textContent = '+ Add Output';
    this.addOutputBtn.addEventListener('click', () => this.onAddOutput?.());
    outputHeader.appendChild(this.addOutputBtn);

    this.outputStripContainer = document.createElement('div');
    this.outputStripContainer.className = 'strip-group';

    outputSection.appendChild(outputHeader);
    outputSection.appendChild(this.outputStripContainer);

    panel.appendChild(inputSection);
    panel.appendChild(routing);
    panel.appendChild(outputSection);

    this.container.appendChild(panel);

    // --- Buffer size control ---
    this.container.appendChild(this._buildBufferSizeRow());

  }

  _buildBufferSizeRow() {
    const row = document.createElement('div');
    row.className = 'buffer-size-row';

    const label = document.createElement('span');
    label.className = 'buffer-size-label';
    label.textContent = 'Buffer Size';
    row.appendChild(label);

    const dropdownWrap = document.createElement('div');
    dropdownWrap.className = 'buffer-size-dropdown-wrap';
    this._bufferDropdown = new CustomDropdown(dropdownWrap, { placeholder: 'Auto' });
    this._bufferDropdown.setItems([
      { value: '', label: 'Auto (default)' },
      { value: '64', label: '64 samples' },
      { value: '128', label: '128 samples' },
      { value: '256', label: '256 samples' },
      { value: '512', label: '512 samples' },
      { value: '1024', label: '1024 samples' },
    ]);
    this._bufferDropdown.value = '';
    this._bufferDropdown.onChange = (val) => {
      const samples = val ? parseInt(val, 10) : null;
      this._updateBufferEstimate(samples);
      this.onBufferSizeChange?.(samples);
    };
    row.appendChild(dropdownWrap);

    this._bufferEstimate = document.createElement('span');
    this._bufferEstimate.className = 'buffer-size-estimate';
    row.appendChild(this._bufferEstimate);

    return row;
  }

  _updateBufferEstimate(samples) {
    if (!samples) {
      this._bufferEstimate.textContent = '';
      return;
    }
    const ms = (samples / 48000) * 1000;
    this._bufferEstimate.textContent = `~${ms.toFixed(1)} ms at 48kHz`;
  }

  // --- Dynamic strip management ---

  addInputStrip(channelId, deviceId) {
    const strip = this._createStrip('IN', 'input', channelId);

    strip.deviceSelector.onChange = (devId) =>
      this.onInputDeviceChange?.(channelId, devId);

    strip.slider.addEventListener('input', () => {
      const val = parseFloat(strip.slider.value);
      strip.gainLabel.textContent = `${Math.round(val * 100)}%`;
      this.onInputGainChange?.(channelId, val);
    });

    strip.muteBtn.addEventListener('click', () =>
      this.onInputMuteToggle?.(channelId));

    strip.removeBtn.addEventListener('click', () =>
      this.onRemoveInput?.(channelId));

    strip.deviceSelector.update(this.devices);
    if (deviceId) strip.deviceSelector.value = deviceId;

    this.inputStripContainer.appendChild(strip.el);
    this.inputStrips.set(channelId, strip);
    this._updateRemoveButtons();
    return strip;
  }

  removeInputStrip(channelId) {
    const strip = this.inputStrips.get(channelId);
    if (!strip) return;
    strip.el.remove();
    this.inputStrips.delete(channelId);
    this._updateRemoveButtons();
  }

  addOutputStrip(channelId, deviceId) {
    const strip = this._createStrip('OUT', 'output', channelId);

    strip.deviceSelector.onChange = (devId) =>
      this.onOutputDeviceChange?.(channelId, devId);

    strip.slider.addEventListener('input', () => {
      const val = parseFloat(strip.slider.value);
      strip.gainLabel.textContent = `${Math.round(val * 100)}%`;
      this.onOutputGainChange?.(channelId, val);
    });

    strip.muteBtn.addEventListener('click', () =>
      this.onOutputMuteToggle?.(channelId));

    strip.removeBtn.addEventListener('click', () =>
      this.onRemoveOutput?.(channelId));

    strip.deviceSelector.update(this.devices);
    if (deviceId) strip.deviceSelector.value = deviceId;

    this.outputStripContainer.appendChild(strip.el);
    this.outputStrips.set(channelId, strip);
    this._updateRemoveButtons();
    return strip;
  }

  removeOutputStrip(channelId) {
    const strip = this.outputStrips.get(channelId);
    if (!strip) return;
    strip.el.remove();
    this.outputStrips.delete(channelId);
    this._updateRemoveButtons();
  }

  _createStrip(label, kind, channelId) {
    const el = document.createElement('div');
    el.className = 'mixer-strip';
    el.dataset.channelId = channelId;
    el.dataset.kind = kind;

    // Label
    const stripLabel = document.createElement('div');
    stripLabel.className = 'strip-label';
    stripLabel.textContent = label;
    el.appendChild(stripLabel);

    // Device selector
    const deviceSelector = new DeviceSelector(el, label, kind);

    // Meter canvas (small vertical bar)
    const meterCanvas = document.createElement('canvas');
    meterCanvas.className = 'meter-canvas';
    meterCanvas.width = 12;
    meterCanvas.height = 40;
    el.appendChild(meterCanvas);

    // Gain slider (horizontal)
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'gain-slider';
    slider.min = '0';
    slider.max = '2';
    slider.step = '0.01';
    slider.value = '1';
    el.appendChild(slider);

    // Gain value label
    const gainLabel = document.createElement('div');
    gainLabel.className = 'gain-value';
    gainLabel.textContent = '100%';
    el.appendChild(gainLabel);

    // Mute button
    const muteBtn = document.createElement('button');
    muteBtn.className = 'mute-btn';
    muteBtn.textContent = 'M';
    el.appendChild(muteBtn);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '\u00d7';
    removeBtn.title = 'Remove';
    el.appendChild(removeBtn);

    return { el, deviceSelector, meterCanvas, slider, gainLabel, muteBtn, removeBtn };
  }

  /** Hide remove buttons when only one strip remains in a group */
  _updateRemoveButtons() {
    const hideInputRemove = this.inputStrips.size <= 1;
    for (const strip of this.inputStrips.values()) {
      strip.removeBtn.style.display = hideInputRemove ? 'none' : '';
    }
    const hideOutputRemove = this.outputStrips.size <= 1;
    for (const strip of this.outputStrips.values()) {
      strip.removeBtn.style.display = hideOutputRemove ? 'none' : '';
    }
  }

  setInputMuted(channelId, muted) {
    const strip = this.inputStrips.get(channelId);
    if (strip) strip.muteBtn.classList.toggle('muted', muted);
  }

  setOutputMuted(channelId, muted) {
    const strip = this.outputStrips.get(channelId);
    if (strip) strip.muteBtn.classList.toggle('muted', muted);
  }

  updateDevices(devices) {
    this.devices = devices;
    for (const strip of this.inputStrips.values()) {
      strip.deviceSelector.update(devices);
    }
    for (const strip of this.outputStrips.values()) {
      strip.deviceSelector.update(devices);
    }
  }

  updateLatency(ms, bridgeMs, breakdown) {
    let text = `${ms.toFixed(1)} ms`;
    const hasBridge = bridgeMs !== undefined && this.outputStrips.size > 1;
    if (hasBridge) {
      text += ` (+${bridgeMs.toFixed(1)} ms bridge)`;
    }
    this.latencyEl.textContent = text;

    // Update tooltip breakdown
    if (breakdown) {
      let tip = `Base latency: ${breakdown.baseMs.toFixed(1)} ms\n`;
      tip += `Output latency: ${breakdown.outputMs.toFixed(1)} ms\n`;
      if (hasBridge) {
        tip += `Bridge latency: ${bridgeMs.toFixed(1)} ms\n`;
      }
      const total = breakdown.baseMs + breakdown.outputMs + (hasBridge ? bridgeMs : 0);
      tip += `Total: ${total.toFixed(1)} ms`;
      this._latencyTooltip.textContent = tip;
    }
  }
}
