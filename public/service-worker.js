const CACHE_VERSION = 'v2';
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

// Push Notifications
self.addEventListener('push', event => {
  let data = { title: 'Paróquia de São Nicolau', body: '', url: '/', tag: 'psn' };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  // Padrão de vibração agressivo: 4 pulsos fortes com pausas curtas
  const vibrationPattern = [600, 200, 600, 200, 600, 200, 600];

  const options = {
    body:             data.body,
    icon:             '/icon-192.png',
    badge:            '/icon-192.png',
    data:             { url: data.url },
    tag:              data.tag,
    renotify:         true,           // vibra/toca mesmo se já existe notificação com o mesmo tag
    requireInteraction: true,         // fica visível até o utilizador interagir (Android)
    vibrate:          vibrationPattern,
    silent:           false,          // garante que o som não está silenciado pela API
    timestamp:        Date.now(),
    actions: [
      { action: 'open',  title: '📱 Abrir app' },
      { action: 'close', title: 'Fechar'        }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
