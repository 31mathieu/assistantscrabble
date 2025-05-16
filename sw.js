/**
 * Service Worker pour l'Assistant Scrabble
 * Permet l'utilisation de l'application en mode hors ligne
 */

// Nom du cache pour stocker les ressources
const CACHE_NAME = 'scrabble-assistant-cache-v1';

// Liste des fichiers à mettre en cache pour le fonctionnement hors ligne
const RESOURCES_TO_CACHE = [
  'index.html',
  'scrabble.js',
  'scrabble.css',
  'manifest.json',
  'francais.dic',
  'english.dic',
  'icon-192x192.png',
  'icon-512x512.png'
];

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation en cours');
  
  // Mise en cache des ressources
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Mise en cache des ressources');
        return cache.addAll(RESOURCES_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Forcer l'activation immédiate
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation en cours');
  
  // Nettoyer les anciens caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim()) // Prendre le contrôle des clients
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
  console.log('Service Worker: Interception de la requête', event.request.url);
  
  // Stratégie "Cache First, Network Fallback"
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Renvoyer la ressource mise en cache si disponible
        if (cachedResponse) {
          console.log('Service Worker: Ressource trouvée dans le cache', event.request.url);
          return cachedResponse;
        }
        
        // Sinon faire la requête réseau
        console.log('Service Worker: Récupération depuis le réseau', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Mettre en cache la nouvelle ressource pour une utilisation future
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          });
      })
      .catch(error => {
        console.error('Service Worker: Erreur de récupération', error);
        // Possibilité d'afficher une page d'erreur hors ligne
      })
  );
});