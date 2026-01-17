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
                return clients.openWindow('./index.html');
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
            // Get today's exercise (simplified version)
            const exercises = [
                "30 jumping jacks",
                "20 push-ups",
                "15 squats",
                "1-minute plank",
                "20 lunges (10 each leg)",
                "15 burpees",
                "25 sit-ups",
                "30-second wall sit",
                "20 mountain climbers",
                "10 tricep dips",
                "15 high knees (each leg)",
                "20 bicycle crunches",
                "10 jump squats",
                "15 leg raises",
                "30 butt kicks",
                "12 pike push-ups",
                "20 Russian twists",
                "15 box jumps (or step-ups)",
                "1-minute superman hold",
                "20 side lunges (10 each side)"
            ];
            
            const dateNumber = now.getTime();
            const index = dateNumber % exercises.length;
            const exercise = exercises[index];
            
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
