import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  server: {
    port: 3001,
  },
  define: {
    // Set by CI (web-update workflow) for live-update bundles; falls back to package.json.
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || pkg.version),
  },
});
