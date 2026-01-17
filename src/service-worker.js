// Service Worker for handling notifications even when page is closed

const NOTIFICATION_TAG = 'daily-exercise-reminder';

// Listen for messages from the main page
self.addEventListener('message', (event) => {
    if (event.data.type === 'SCHEDULE_NOTIFICATION') {
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
        // Get today's exercise from cache
        let exercise = "your daily exercise";
        try {
            const exerciseDefsResponse = await cache.match('exerciseDefinitions');
            if (exerciseDefsResponse) {
                const exerciseDefinitions = await exerciseDefsResponse.json();
                // Use consistent date-based index (without time component)
                const MS_PER_DAY = 1000 * 60 * 60 * 24;
                const date = new Date(today + 'T00:00:00');
                const dateNumber = date.getTime();
                const index = Math.floor(dateNumber / MS_PER_DAY) % exerciseDefinitions.length;
                const definition = exerciseDefinitions[index];
                
                // Generate random reps within default range
                const reps = Math.floor(Math.random() * (definition.maxReps - definition.minReps + 1)) + definition.minReps;
                
                // Format exercise text (matching main script format)
                if (definition.unit === "seconds") {
                    const minutes = Math.floor(reps / 60);
                    const seconds = reps % 60;
                    if (minutes > 0 && seconds === 0) {
                        exercise = `${minutes}-minute ${definition.name}`;
                    } else if (minutes > 0) {
                        exercise = `${minutes}:${String(seconds).padStart(2, '0')} ${definition.name}`;
                    } else {
                        exercise = `${reps}-second ${definition.name}`;
                    }
                } else {
                    exercise = `${reps} ${definition.name}`;
                }
            }
        } catch (error) {
            console.error('Could not load exercise definitions from cache:', error);
        }
        
        // Show notification
        await self.registration.showNotification('Time for your exercise! 💪', {
            body: `Today's exercise: ${exercise}`,
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
self.addEventListener('install', (event) => {
    console.log('Service worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activated');
    event.waitUntil(clients.claim());
});
