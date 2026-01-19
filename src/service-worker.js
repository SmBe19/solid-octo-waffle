// Service Worker for handling notifications and offline caching (PWA support)

const CACHE_VERSION = '2026-01-19-001'; // Update this version when deploying changes
const CACHE_NAME = `daily-exercise-v${CACHE_VERSION}`;
const NOTIFICATION_TAG = 'daily-exercise-reminder';

// Send message to all clients about the update
function notifyClientsAboutUpdate() {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'UPDATE_AVAILABLE'
            });
        });
    });
}

// Files to cache for offline functionality
const urlsToCache = [
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/favicon.ico',
    '/favicon.svg',
    '/favicon-192x192.png',
    '/favicon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service worker installed - new version available');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Notify clients about the update
                notifyClientsAboutUpdate();
                // Immediately activate the new service worker
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service worker activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== 'notification-cache') {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

// Fetch event - network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Network-first strategy for HTML files to ensure updates are fetched
    if (event.request.mode === 'navigate' || event.request.destination === 'document' || 
        url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '/index.html') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone and cache the response
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch((error) => {
                                console.error('Failed to cache:', error);
                            });
                    }
                    return response;
                })
                .catch((error) => {
                    // Fallback to cache if network fails
                    console.log('Network failed, falling back to cache');
                    return caches.match(event.request)
                        .then((response) => {
                            if (response) {
                                return response;
                            }
                            return new Response('Offline - content not available', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: new Headers({
                                    'Content-Type': 'text/plain'
                                })
                            });
                        });
                })
        );
        return;
    }
    
    // Cache-first strategy for other assets (CSS, JS, images)
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    // Cache the new response
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        })
                        .catch((error) => {
                            console.error('Failed to cache:', error);
                        });
                    
                    return response;
                }).catch((error) => {
                    console.error('Fetch failed:', error);
                    // Return a basic offline response
                    return new Response('Offline - content not available', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
            })
    );
});

// Listen for messages from the main page
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        // When user accepts update, activate new service worker immediately
        self.skipWaiting();
    } else if (event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { enabled } = event.data;
        
        if (!enabled) {
            // Cancel any scheduled alarms
            if (self.registration && self.registration.showNotification) {
                self.registration.getNotifications({ tag: NOTIFICATION_TAG }).then(notifications => {
                    notifications.forEach(notification => notification.close());
                });
            }
        }
        // Note: Actual notification scheduling is handled by:
        // 1. Periodic Background Sync (periodicsync event) when page is closed
        // 2. setInterval in main page when page is open
        // Service Workers cannot use setTimeout/setInterval for scheduling
    } else if (event.data.type === 'CHECK_NOTIFICATION') {
        checkAndShowNotification(event.data.notificationTime);
    }
});

// Handle periodic background sync (when page is closed)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-notification') {
        event.waitUntil(checkScheduledNotifications());
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Open or focus the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(self.location.origin + '/index.html');
            }
        })
    );
});

// Check scheduled notifications from periodic sync
async function checkScheduledNotifications() {
    try {
        // Read notification settings from cache
        const cache = await caches.open('notification-cache');
        const settingsResponse = await cache.match('notificationSettings');
        
        if (settingsResponse) {
            const settings = await settingsResponse.json();
            if (settings.enabled) {
                await checkAndShowNotification(settings.notificationTime);
            }
        }
    } catch (error) {
        console.error('Error checking scheduled notifications:', error);
    }
}

// Check if it's time to show notification
async function checkAndShowNotification(notificationTime) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if we already sent a notification today
    const cache = await caches.open('notification-cache');
    const lastNotificationDate = await cache.match('lastNotificationDate');
    
    if (lastNotificationDate) {
        const lastDate = await lastNotificationDate.text();
        if (lastDate === today) {
            return; // Already sent notification today
        }
    }
    
    // Parse notification time
    const [notifHours, notifMinutes] = notificationTime.split(':').map(Number);
    const notifTimeInMinutes = notifHours * 60 + notifMinutes;
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Send notification if current time is at or past the notification time
    if (currentTimeInMinutes >= notifTimeInMinutes && self.registration) {
        // Show notification
        await self.registration.showNotification('Time for your exercise! 💪', {
            body: 'Time to do your daily exercise!',
            tag: NOTIFICATION_TAG,
            requireInteraction: false,
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        });
        
        // Store the date we sent the notification
        await cache.put('lastNotificationDate', new Response(today));
    }
}

// Keep service worker alive and check periodically
// Note: install and activate handlers are defined at the top of this file
