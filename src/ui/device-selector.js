export class DeviceSelector {
  constructor(container, label, kind) {
    this.kind = kind; // 'input' or 'output'
    this.onChange = null;

    this.el = document.createElement('div');
    this.el.className = 'strip-device';

    this.select = document.createElement('select');
    this.select.title = `Select ${kind} device`;
    this.select.addEventListener('change', () => {
      this.onChange?.(this.select.value);
    });

    this.el.appendChild(this.select);
    container.appendChild(this.el);
  }

  update(devices) {
    const list = this.kind === 'input' ? devices.inputs : devices.outputs;
    const currentValue = this.select.value;

    // Clear options without innerHTML
    while (this.select.firstChild) {
      this.select.removeChild(this.select.firstChild);
    }

    list.forEach(device => {
      const opt = document.createElement('option');
      opt.value = device.deviceId;
      opt.textContent = _cleanLabel(device.label, this.kind, device.deviceId);
      this.select.appendChild(opt);
    });

    // Restore selection if still available
    if ([...this.select.options].some(o => o.value === currentValue)) {
      this.select.value = currentValue;
    }
  }

  get value() {
    return this.select.value;
  }
}

/** Strip common OS prefixes and trim long device names */
function _cleanLabel(label, kind, deviceId) {
  if (!label) return `${kind === 'input' ? 'Mic' : 'Speaker'} ${deviceId.slice(0, 6)}`;

  let clean = label;
  // Strip Windows-style prefixes
  clean = clean.replace(/^Default\s*[-\u2013]\s*/i, '');
  clean = clean.replace(/^Communications\s*[-\u2013]\s*/i, '');
  // Strip trailing parenthetical driver names e.g. "(Realtek High Definition Audio)"
  // but only if there's a meaningful name before it
  const parenMatch = clean.match(/^(.{6,}?)\s*\([^)]{15,}\)$/);
  if (parenMatch) clean = parenMatch[1].trim();

  return clean || label;
}
