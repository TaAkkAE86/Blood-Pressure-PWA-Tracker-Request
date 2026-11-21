const FIRED = 'pulsequest-fired';
export const notifSupported = () => typeof Notification !== 'undefined';

export async function notify(title, body) {
  if (!notifSupported() || Notification.permission !== 'granted') return false;
  const opts = { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'pq-reminder', renotify: true, data: { url: './?screen=record' } };
  try {
    const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
    if (reg) { await reg.showNotification(title, opts); return true; }
  } catch (e) {}
  try { new Notification(title, opts); return true; } catch (e) { return false; }
}

export function loadFired(today) {
  try {
    const all = JSON.parse(localStorage.getItem(FIRED) || '{}');
    return Object.fromEntries(Object.entries(all).filter(([k]) => k.startsWith(today)));
  } catch (e) { return {}; }
}
export function saveFired(obj) { try { localStorage.setItem(FIRED, JSON.stringify(obj)); } catch (e) {} }
