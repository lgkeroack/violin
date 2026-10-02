import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const APP_VERSION = process.env.APP_VERSION || pkg.version;

/**
 * Emits dist/sw.js: a small service worker that precaches every build file
 * so the PWA works offline. Navigations are network-first (fresh when
 * online), hashed assets are cache-first.
 */
function serviceWorkerPlugin() {
  return {
    name: 'vaw-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter(f => !f.endsWith('.map'));
      const publicFiles = ['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
      const precache = ['./', ...new Set([...files, ...publicFiles])];
      const source = readFileSync(new URL('./src/pwa/sw-template.js', import.meta.url), 'utf8')
        .replace('__VERSION__', JSON.stringify(`${APP_VERSION}-${Date.now().toString(36)}`))
        .replace('__PRECACHE__', JSON.stringify(precache));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  // Relative paths so the same build works on GitHub Pages (/violin/),
  // in the Android app and as an over-the-air bundle.
  base: './',
  server: {
    port: 3001,
  },
  define: {
    // Set by CI (web-update workflow) for live-update bundles; falls back to package.json.
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  plugins: [serviceWorkerPlugin()],
});
