// Service Worker for Facturly PWA
const CACHE_NAME = 'facturly-v3';
const STATIC_CACHE_NAME = 'facturly-static-v3';
const urlsToCache = [
  '/',
  '/fr',
  '/en',
  '/icon.png',
  '/site.webmanifest',
];

// Assets statiques à mettre en cache (CSS, JS, fonts)
const staticAssetsToCache = [
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/fonts/',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches, then claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Ne jamais mettre en cache les requêtes API (même origine /api ou cross-origin backend)
function shouldSkipCache(request, url) {
  if (request.method !== 'GET') return true;
  if (url.pathname.startsWith('/api/')) return true;
  if (url.origin !== self.location.origin) return true;
  return false;
}

// Fetch event - serve from cache, fallback to network with cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (shouldSkipCache(request, url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Stratégie Cache First pour les assets statiques
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((response) => {
          if (response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Stratégie Network First pour les pages HTML (same-origin uniquement)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200 && request.method === 'GET' && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('/') || caches.match('/fr');
          return null;
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Facturly',
    body: 'Nouvelle notification Facturly',
    icon: '/icon.png',
    badge: '/icon.png',
    data: {},
  };

  // Parser les données JSON si disponibles
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || {},
        tag: data.tag || 'facturly-notification',
        requireInteraction: data.requireInteraction || false,
        vibrate: data.vibrate || [200, 100, 200],
      };
    } catch (e) {
      // Si ce n'est pas du JSON, utiliser le texte brut
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: notificationData.vibrate,
    tag: notificationData.tag || 'facturly-notification',
    requireInteraction: notificationData.requireInteraction || false,
    data: notificationData.data,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event – URLs avec locale (default /fr)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const locale = notificationData.locale || 'fr';
  let path = '/';
  if (notificationData.type === 'invoice_paid' && notificationData.invoiceId) {
    path = `/${locale}/invoices/${notificationData.invoiceId}`;
  } else if (notificationData.type === 'unsent_invoices') {
    path = `/${locale}/invoices?status=draft`;
  } else if (notificationData.type === 'overdue_invoice' && notificationData.invoiceId) {
    path = `/${locale}/invoices/${notificationData.invoiceId}`;
  } else {
    path = `/${locale}`;
  }
  event.waitUntil(clients.openWindow(path));
});
