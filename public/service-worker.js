const CACHE_VERSION = 'v4';
const CACHE_NAME = `psn-cache-${CACHE_VERSION}`;
const API_HOSTNAME = 'snref-backend-8d85ffa999cd.herokuapp.com';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logopsn.png',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('psn-cache-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  if (url.hostname === API_HOSTNAME) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Sem ligação à internet' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});

// ── Push Notifications ────────────────────────────────────────────────────────

self.addEventListener('push', event => {
  let payload = { title: 'Paróquia de São Nicolau', body: '', url: '/', tag: 'psn' };

  if (event.data) {
    try {
      // Tenta decodificar como JSON
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch (_) {
      // Se não for JSON, tenta como texto simples
      event.data.text().then(text => {
        payload.body = text || 'Nova notificação';
        payload.title = 'Paróquia de São Nicolau';
        mostrarNotificacao(payload);
      });
      return;
    }
  }
  mostrarNotificacao(payload);
});

function mostrarNotificacao(payload) {
  const VIBRATE = [600, 200, 600, 200, 600, 200, 600];
  const options = {
    body:               payload.body,
    icon:               '/icon-192.png',
    badge:              '/icon-192.png',
    tag:                payload.tag || 'psn',
    renotify:           true,
    requireInteraction: true,
    vibrate:            VIBRATE,
    timestamp:          Date.now(),
    data:               { url: payload.url }
  };
  self.registration.showNotification(payload.title, options)
    .catch(() =>
      self.registration.showNotification(payload.title, {
        body:  payload.body,
        icon:  '/icon-192.png',
        badge: '/icon-192.png',
        tag:   payload.tag || 'psn',
        data:  { url: payload.url }
      })
    );
}

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const rawUrl   = event.notification.data?.url || '/';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // 1. Se já há uma janela exactamente nessa URL, foca-a
      const exact = clientList.find(c => c.url === targetUrl);
      if (exact && 'focus' in exact) return exact.focus();

      // 2. Se há qualquer janela da app, navega-a para o URL alvo
      const appWin = clientList.find(c => c.url.startsWith(self.location.origin));
      if (appWin) {
        if ('navigate' in appWin) {
          return appWin.navigate(targetUrl).then(() => appWin.focus());
        }
        return appWin.focus();
      }

      // 3. Abre uma nova janela
      return clients.openWindow(targetUrl);
    })
  );
});
