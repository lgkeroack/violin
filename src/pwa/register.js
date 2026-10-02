import { Capacitor } from '@capacitor/core';

/**
 * Progressive Web App support (browser only — the Android app uses live updates):
 * - registers the service worker for offline use + automatic updates
 * - shows "Install app" when the browser offers installation
 * - offers a reload when a new version has been downloaded
 */
export function initPwa({ notify } = {}) {
  if (Capacitor.isNativePlatform()) return;

  // Install button
  const installBtn = document.getElementById('install-btn');
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn?.classList.remove('hidden');
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => {});
    deferredPrompt = null;
    installBtn.classList.add('hidden');
  });
  window.addEventListener('appinstalled', () => installBtn?.classList.add('hidden'));

  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  const offerUpdate = (worker) => {
    notify?.({
      text: 'A new version is ready.',
      action: 'Reload',
      onAction: () => worker.postMessage('SKIP_WAITING'),
    });
  };

  navigator.serviceWorker.register('./sw.js').then((reg) => {
    if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw?.addEventListener('statechange', () => {
        // Only prompt for updates, not the very first install
        if (nw.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(nw);
      });
    });
    // Check for a new version whenever the app comes back to the foreground
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) reg.update().catch(() => {});
    });
  }).catch((err) => console.warn('Service worker registration failed:', err));
}
