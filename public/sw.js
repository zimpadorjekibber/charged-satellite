
const CACHE_NAME = 'tashizom-cache-v1';
const IMAGE_CACHE_NAME = 'tashizom-images-v1';

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('[Service Worker] Installed');
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log('[Service Worker] Activated');
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Cache Images (Unsplash, Firebase, or destination=image)
    if (event.request.destination === 'image' || url.hostname.includes('unsplash.com') || url.hostname.includes('firebasestorage.googleapis.com')) {
        event.respondWith(
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        // Return cached image, but allow re-fetching in background if needed (optional)
                        // For now, Cache First is fastest for "loading quickly".
                        return cachedResponse;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // Default: Network Only for API/Navigation to ensure freshness in Dev
    // In production, we might cache static JS/CSS
});
