import { CustomDropdown } from './custom-dropdown.js';

/**
 * Compact audio-input selector for phones/tablets and desktops:
 * built-in mic, wired headset (TRRS) mics, USB audio interfaces / USB mics.
 */

export function classifyInput(device) {
  const l = (device?.label || '').toLowerCase();
  if (/bluetooth|airpods|buds|hands-?free|\bbt\b|hfp|sco/.test(l)) return 'bluetooth';
  if (/usb|interface|scarlett|focusrite|irig|behringer|presonus|audient|motu|zoom|tascam|roland|boss|steinberg|line in|line-in|instrument|guitar|xlr|ux1|um2|evo|ssl/.test(l)) return 'usb';
  if (/headset|wired|headphone|earphone|earpiece|jack|3\.5|trrs|external/.test(l)) return 'wired';
  return 'builtin';
}

const KIND_LABEL = {
  usb: 'USB audio',
  wired: 'Wired headset',
  bluetooth: 'Bluetooth (adds latency)',
  builtin: 'Built-in mic',
};

function cleanLabel(device, idx) {
  let l = device.label || `Input ${idx + 1}`;
  l = l.replace(/^Default\s*[-–]\s*/i, '').replace(/^Communications\s*[-–]\s*/i, '');
  return l;
}

export class InputPicker {
  constructor(container) {
    this.onDeviceChange = null;  // (deviceId) => void
    this.onChannelMode = null;   // ('mix'|'left'|'right') => void
    this.onGainChange = null;    // (gain) => void

    this.el = document.createElement('div');
    this.el.className = 'ip-root';

    const lab = document.createElement('span');
    lab.className = 'sb-label';
    lab.textContent = 'Input';
    this.el.appendChild(lab);

    const ddWrap = document.createElement('div');
    ddWrap.className = 'sb-dd ip-dd';
    this.dd = new CustomDropdown(ddWrap, { placeholder: 'Microphone…', title: 'Audio input' });
    this.dd.onChange = (v) => this.onDeviceChange?.(v);
    this.el.appendChild(ddWrap);

    const chWrap = document.createElement('div');
    chWrap.className = 'sb-dd ip-ch';
    this.ch = new CustomDropdown(chWrap, { placeholder: 'Channel', title: 'Input channel' });
    this.ch.setItems([
      { value: 'mix', label: 'Mix (L+R)' },
      { value: 'left', label: 'Left / In 1' },
      { value: 'right', label: 'Right / In 2' },
    ]);
    this.ch.value = 'mix';
    this.ch.onChange = (v) => this.onChannelMode?.(v);
    this.chWrap = chWrap;
    this.el.appendChild(chWrap);

    const gainWrap = document.createElement('label');
    gainWrap.className = 'ip-gain';
    gainWrap.title = 'Input boost (useful for quiet line/USB inputs)';
    const g = document.createElement('input');
    g.type = 'range';
    g.min = '0.25';
    g.max = '4';
    g.step = '0.05';
    g.value = '1';
    this.gainInput = g;
    const gv = document.createElement('span');
    gv.textContent = '×1.0';
    g.addEventListener('input', () => {
      gv.textContent = `×${Number(g.value).toFixed(1)}`;
      this.onGainChange?.(Number(g.value));
    });
    gainWrap.append(g, gv);
    this.el.appendChild(gainWrap);

    this.meter = document.createElement('div');
    this.meter.className = 'ip-meter';
    this.meterFill = document.createElement('div');
    this.meterFill.className = 'ip-meter-fill';
    this.meter.appendChild(this.meterFill);
    this.el.appendChild(this.meter);

    this.hint = document.createElement('div');
    this.hint.className = 'ip-hint';
    this.el.appendChild(this.hint);

    container.appendChild(this.el);
  }

  setDevices(inputs, currentId) {
    this._inputs = inputs;
    const items = inputs.map((d, i) => ({
      value: d.deviceId,
      label: `${cleanLabel(d, i)}  ·  ${KIND_LABEL[classifyInput(d)]}`,
    }));
    this.dd.setItems(items);
    if (currentId && items.some(i => i.value === currentId)) this.dd.value = currentId;
    this._updateHint(currentId);
  }

  setCurrent(deviceId) {
    this.dd.value = deviceId;
    this._updateHint(deviceId);
  }

  setChannelCount(n) {
    this.chWrap.classList.toggle('hidden', n < 2);
  }

  setGain(v) {
    this.gainInput.value = String(v);
    this.gainInput.dispatchEvent(new Event('input'));
  }

  _updateHint(id) {
    const d = this._inputs?.find(x => x.deviceId === id);
    const kind = d ? classifyInput(d) : null;
    this.hint.textContent = kind === 'bluetooth'
      ? 'Bluetooth mics add a lot of delay. Use a wired or USB input for play-along.'
      : kind === 'usb' ? 'USB input: pick the channel your instrument is plugged into.'
      : '';
  }

  /** @param {number} rmsDb */
  updateLevel(rmsDb) {
    const norm = Math.max(0, Math.min(1, (rmsDb + 60) / 60));
    this.meterFill.style.width = `${norm * 100}%`;
    this.meterFill.classList.toggle('hot', rmsDb > -6);
  }
}
