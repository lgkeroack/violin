export class DeviceManager {
  constructor() {
    this.devices = { inputs: [], outputs: [] };
    this.onDevicesChanged = null;
  }

  async enumerate() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.devices.inputs = devices.filter(d => d.kind === 'audioinput');
    this.devices.outputs = devices.filter(d => d.kind === 'audiooutput');
    return this.devices;
  }

  listenForChanges() {
    navigator.mediaDevices.addEventListener('devicechange', async () => {
      await this.enumerate();
      this.onDevicesChanged?.(this.devices);
    });
  }

  async requestPermission() {
    // Minimal getUserMedia to trigger permission prompt, then stop
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
  }

  async getInputStream(deviceId) {
    const audioConstraints = {
      echoCancellation: { ideal: false },
      noiseSuppression: { ideal: false },
      autoGainControl: { ideal: false },
    };
    if (deviceId) {
      audioConstraints.deviceId = { exact: deviceId };
    }
    return navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
  }

}
