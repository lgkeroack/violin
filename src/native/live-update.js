import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

/**
 * Over-the-air updates for the Android app (self-hosted, no account needed).
 *
 * Every push to main runs .github/workflows/web-update.yml, which builds the
 * web app, zips it and publishes it to the "web-latest" GitHub Release along
 * with update.json:
 *   { version, url, checksum, minNative, notes }
 *
 * On launch and whenever the app returns to the foreground we fetch that
 * manifest, download a newer bundle in the background and stage it. It is
 * applied the next time the app is backgrounded/restarted, or immediately if
 * the player taps "Restart now". A bundle that fails to start is rolled back
 * automatically (notifyAppReady + appReadyTimeout).
 */

const MANIFEST_URL = 'https://github.com/lgkeroack/violin/releases/download/web-latest/update.json';
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export const BUNDLE_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

let checking = false;
let lastCheck = 0;
let staged = null;

/** Compare dotted numeric versions: returns <0, 0, >0. */
function compareVersions(a, b) {
  const pa = String(a).split(/[.-]/).map(n => parseInt(n, 10) || 0);
  const pb = String(b).split(/[.-]/).map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

async function fetchManifest() {
  const res = await CapacitorHttp.get({
    url: `${MANIFEST_URL}?t=${Date.now()}`,
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    responseType: 'json',
  });
  if (res.status < 200 || res.status >= 300) throw new Error(`manifest HTTP ${res.status}`);
  return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
}

async function checkForUpdate(onReady) {
  if (checking || staged) return;
  checking = true;
  lastCheck = Date.now();
  try {
    const manifest = await fetchManifest();
    if (!manifest?.version || !manifest?.url) return;

    const current = await CapacitorUpdater.current();
    const currentVersion = current.bundle?.version === 'builtin' ? BUNDLE_VERSION : current.bundle?.version;
    if (compareVersions(manifest.version, currentVersion) <= 0) return;

    // The bundle may rely on native changes; skip if this APK is too old.
    if (manifest.minNative && compareVersions(current.native, manifest.minNative) < 0) {
      onReady?.({ needsApk: true, version: manifest.version });
      return;
    }

    const { bundles } = await CapacitorUpdater.list();
    let bundle = bundles.find(b => b.version === manifest.version && b.status !== 'error');
    if (!bundle) {
      bundle = await CapacitorUpdater.download({
        url: manifest.url,
        version: manifest.version,
        checksum: manifest.checksum || undefined,
      });
    }
    await CapacitorUpdater.next({ id: bundle.id });
    staged = bundle;
    onReady?.({ version: manifest.version, notes: manifest.notes || '', apply: () => CapacitorUpdater.set({ id: bundle.id }) });
  } catch (err) {
    console.warn('Live update check failed:', err?.message || err);
  } finally {
    checking = false;
  }
}

/**
 * Start live updates. No-op in the browser.
 * @param {{ onReady?: (info: {version:string, notes?:string, apply?:() => Promise<void>, needsApk?:boolean}) => void }} opts
 */
export async function initLiveUpdates({ onReady } = {}) {
  if (!Capacitor.isNativePlatform()) return;

  // Tell the updater this bundle booted fine (otherwise it rolls back).
  try {
    await CapacitorUpdater.notifyAppReady();
  } catch (err) {
    console.warn('notifyAppReady failed:', err?.message || err);
  }

  checkForUpdate(onReady);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastCheck > CHECK_INTERVAL_MS) checkForUpdate(onReady);
  });
}

export async function getVersionInfo() {
  if (!Capacitor.isNativePlatform()) return { bundle: BUNDLE_VERSION, native: 'web' };
  try {
    const cur = await CapacitorUpdater.current();
    return { bundle: cur.bundle?.version === 'builtin' ? BUNDLE_VERSION : cur.bundle?.version, native: cur.native };
  } catch {
    return { bundle: BUNDLE_VERSION, native: '?' };
  }
}
