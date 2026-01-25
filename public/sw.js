// Service Worker for Facturly PWA
const CACHE_NAME = 'facturly-v2';
const STATIC_CACHE_NAME = 'facturly-static-v2';
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

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciennes versions de cache
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network with cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

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
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Ne mettre en cache que les réponses valides
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Stratégie Network First pour les pages et API
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache les réponses réussies
        if (response.status === 200 && request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback sur le cache si le réseau échoue
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si c'est une page et qu'on a un cache, retourner la page d'accueil
          if (request.destination === 'document') {
            return caches.match('/');
          }
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

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  let url = '/';
  
  // Rediriger vers la page appropriée selon le type de notification
  if (notificationData.type === 'invoice_paid' && notificationData.invoiceId) {
    url = `/invoices/${notificationData.invoiceId}`;
  } else if (notificationData.type === 'unsent_invoices') {
    url = '/invoices?status=draft';
  } else if (notificationData.type === 'overdue_invoice' && notificationData.invoiceId) {
    url = `/invoices/${notificationData.invoiceId}`;
  }
  
  event.waitUntil(
    clients.openWindow(url)
  );
});
