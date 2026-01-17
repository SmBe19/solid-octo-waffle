// Service Worker for handling notifications even when page is closed

const NOTIFICATION_TAG = 'daily-exercise-reminder';

// Listen for messages from the main page
self.addEventListener('message', (event) => {
    if (event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { notificationTime, enabled } = event.data;
        
        if (enabled) {
            scheduleNotification(notificationTime);
        } else {
            // Cancel any scheduled alarms
            if (self.registration && self.registration.showNotification) {
                self.registration.getNotifications({ tag: NOTIFICATION_TAG }).then(notifications => {
                    notifications.forEach(notification => notification.close());
                });
            }
        }
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

// Schedule periodic check for notification time
function scheduleNotification(notificationTime) {
    // Service workers can't use setInterval, so we'll rely on periodic checks
    // when the page loads and message passing
    console.log('Service worker: notification scheduled for', notificationTime);
}

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
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (currentTime === notificationTime) {
        const today = now.toISOString().split('T')[0];
        
        // Check if we already sent a notification today
        const cache = await caches.open('notification-cache');
        const lastNotificationDate = await cache.match('lastNotificationDate');
        
        let shouldSend = true;
        if (lastNotificationDate) {
            const lastDate = await lastNotificationDate.text();
            if (lastDate === today) {
                shouldSend = false;
            }
        }
        
        if (shouldSend && self.registration) {
            // Get today's exercise from cache
            let exercise = "your daily exercise";
            try {
                const exercisesResponse = await cache.match('exercises');
                if (exercisesResponse) {
                    const exercises = await exercisesResponse.json();
                    const dateNumber = now.getTime();
                    const index = dateNumber % exercises.length;
                    exercise = exercises[index];
                }
            } catch (error) {
                console.error('Could not load exercises from cache:', error);
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
