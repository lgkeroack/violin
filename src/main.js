import { AudioEngine } from './audio/audio-engine.js';
import { DeviceManager } from './audio/device-manager.js';
import { PitchDetector } from './audio/pitch-detector.js';
import { MixerPanel } from './ui/mixer.js';
import { LevelMeter } from './ui/meters.js';
import { PitchDisplay } from './ui/pitch-display.js';
import { TuningPanel } from './ui/tuning-panel.js';
import { Fingerboard } from './ui/fingerboard.js';

const engine = new AudioEngine();
const deviceManager = new DeviceManager();
const pitchDetector = new PitchDetector();

const pitchSection = document.getElementById('pitch-section');
const tuningSection = document.getElementById('tuning-section');
const fingerboardSection = document.getElementById('fingerboard-section');
const mixerSection = document.getElementById('mixer-section');

// Build UI
const pitchDisplay = new PitchDisplay(pitchSection);
const tuningPanel = new TuningPanel(tuningSection);
const fingerboard = new Fingerboard(fingerboardSection);
const mixer = new MixerPanel(mixerSection);

tuningPanel.onTuningChange = (tuningKey) => fingerboard.setTuning(tuningKey);

/** @type {Map<number, LevelMeter>} */
const inputMeters = new Map();
/** @type {Map<number, LevelMeter>} */
const outputMeters = new Map();

let animFrameId = null;
let engineReady = false;

async function ensureEngine() {
  if (engineReady) return;
  await engine.init();
  engineReady = true;
  startRenderLoop();
}

// --- Input management ---

async function addInput(deviceId) {
  await ensureEngine();
  // Always create channel + strip, even if stream fails
  const channelId = engine.createInput();
  const strip = mixer.addInputStrip(channelId, deviceId);
  inputMeters.set(channelId, new LevelMeter(strip.meterCanvas));

  // Try to connect audio stream
  if (deviceId) {
    try {
      const stream = await deviceManager.getInputStream(deviceId);
      engine.connectInputStream(channelId, stream);
    } catch (err) {
      console.warn('Input stream unavailable:', err.message);
    }
  }
  return channelId;
}

function removeInput(channelId) {
  if (engine.inputs.size <= 1) return; // prevent removing last
  engine.removeInput(channelId);
  mixer.removeInputStrip(channelId);
  inputMeters.delete(channelId);
}

async function switchInputDevice(channelId, deviceId) {
  try {
    const stream = await deviceManager.getInputStream(deviceId);
    engine.switchInputDevice(channelId, stream);
  } catch (err) {
    console.error('Failed to switch input device:', err);
  }
}

// --- Output management ---

async function addOutput(deviceId) {
  try {
    await ensureEngine();
    const channelId = await engine.addOutput(deviceId);
    if (channelId === -1) return; // cap reached
    const strip = mixer.addOutputStrip(channelId, deviceId);
    outputMeters.set(channelId, new LevelMeter(strip.meterCanvas));
    return channelId;
  } catch (err) {
    console.error('Failed to add output:', err);
  }
}

function removeOutput(channelId) {
  if (engine.outputs.size <= 1) return; // prevent removing last
  engine.removeOutput(channelId);
  mixer.removeOutputStrip(channelId);
  outputMeters.delete(channelId);
}

async function switchOutputDevice(channelId, deviceId) {
  try {
    await engine.switchOutputDevice(channelId, deviceId);
  } catch (err) {
    console.error('Failed to switch output device:', err);
  }
}

// --- Render loop ---

function startRenderLoop() {
  if (animFrameId) return;

  let pitchFrame = 0;
  function renderLoop() {
    // Draw all input meters
    for (const [channelId, meter] of inputMeters) {
      const level = engine.getInputLevel(channelId);
      meter.draw(level.rmsDb, level.peakDb);
    }

    // Draw all output meters
    for (const [channelId, meter] of outputMeters) {
      const level = engine.getOutputLevel(channelId);
      meter.draw(level.rmsDb, level.peakDb);
    }

    // Pitch detection + latency (every other frame)
    pitchFrame++;
    if (pitchFrame % 2 === 0) {
      const { data, sampleRate } = engine.getPitchData();
      const freq = pitchDetector.detect(data, sampleRate);
      pitchDisplay.update(freq);
      tuningPanel.update(freq);
      fingerboard.update(freq);
      mixer.updateLatency(engine.getLatency(), engine.getBridgeLatency());
    }

    animFrameId = requestAnimationFrame(renderLoop);
  }
  renderLoop();
}

// --- Wire mixer callbacks ---

mixer.onAddInput = () => addInput();
mixer.onRemoveInput = (channelId) => removeInput(channelId);
mixer.onAddOutput = () => addOutput();
mixer.onRemoveOutput = (channelId) => removeOutput(channelId);

mixer.onInputDeviceChange = (channelId, deviceId) => switchInputDevice(channelId, deviceId);
mixer.onOutputDeviceChange = (channelId, deviceId) => switchOutputDevice(channelId, deviceId);

mixer.onInputGainChange = (channelId, val) => engine.setInputGain(channelId, val);
mixer.onOutputGainChange = (channelId, val) => engine.setOutputGain(channelId, val);

mixer.onInputMuteToggle = (channelId) => {
  const muted = engine.toggleInputMute(channelId);
  mixer.setInputMuted(channelId, muted);
};
mixer.onOutputMuteToggle = (channelId) => {
  const muted = engine.toggleOutputMute(channelId);
  mixer.setOutputMuted(channelId, muted);
};

// --- Boot ---

async function boot() {
  // Always init engine and create default strips, even if permission fails
  await ensureEngine();

  // Try to get mic permission and enumerate devices
  let devices = { inputs: [], outputs: [] };
  try {
    await deviceManager.requestPermission();
    devices = await deviceManager.enumerate();
  } catch (err) {
    console.warn('Mic permission denied or unavailable:', err.message);
    // Still try to enumerate (labels may be hidden but IDs work)
    try { devices = await deviceManager.enumerate(); } catch (_) {}
  }

  mixer.updateDevices(devices);
  deviceManager.listenForChanges();
  deviceManager.onDevicesChanged = (devs) => mixer.updateDevices(devs);

  // Auto-add one input + one output
  const firstInputId = devices.inputs.length > 0
    ? devices.inputs[0].deviceId
    : undefined;
  const firstOutputId = devices.outputs.length > 0
    ? devices.outputs[0].deviceId
    : undefined;

  // These individually catch their own errors, so one failing won't block the other
  await addInput(firstInputId);
  await addOutput(firstOutputId);
}

boot();
