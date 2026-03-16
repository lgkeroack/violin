import { CustomDropdown } from './custom-dropdown.js';

export class DeviceSelector {
  constructor(container, label, kind) {
    this.kind = kind; // 'input' or 'output'
    this.onChange = null;

    this.el = document.createElement('div');
    this.el.className = 'strip-device';

    this.dropdown = new CustomDropdown(this.el, {
      title: `Select ${kind} device`,
      placeholder: kind === 'input' ? 'Mic...' : 'Speaker...',
    });

    this.dropdown.onChange = (val) => {
      this.onChange?.(val);
    };

    container.appendChild(this.el);
  }

  update(devices) {
    const list = this.kind === 'input' ? devices.inputs : devices.outputs;
    const currentValue = this.dropdown.value;

    const items = list.map(device => ({
      value: device.deviceId,
      label: _cleanLabel(device.label, this.kind, device.deviceId),
    }));

    this.dropdown.setItems(items);

    // Restore selection if still available
    if (items.some(i => i.value === currentValue)) {
      this.dropdown.value = currentValue;
    }
  }

  get value() {
    return this.dropdown.value;
  }

  set value(val) {
    this.dropdown.value = val;
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
