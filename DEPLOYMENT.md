# Deployment Guide

## How to Deploy Updates

When deploying changes to the Solid Octo Waffle app, follow these steps to ensure users receive updates properly:

### 1. Update the Cache Version

Before deploying any code changes, update the `CACHE_VERSION` constant in `src/service-worker.js`:

```javascript
const CACHE_VERSION = '2026-01-19-002'; // Increment this version
```

**Important:** Change this version number every time you deploy. Use a format like:
- Date-based: `YYYY-MM-DD-NNN` (e.g., `2026-01-19-001`)
- Semantic versioning: `v1.2.3`
- Timestamp: `20260119-143000`

### 2. Deploy Your Changes

Deploy all files to your web server, including the updated service worker.

### 3. User Experience

When users visit the app after your deployment:

1. **First Visit After Update:**
   - The new service worker detects the cache version change
   - A banner appears: "🎉 A new version is available!"
   - User can click "Update Now" to reload with the new version
   - Or click "Later" to continue with cached version

2. **Automatic Update:**
   - The app checks for service worker updates every 5 minutes
   - When a new version is found, the update banner appears
   - The service worker immediately activates (skipWaiting)

3. **Offline Support:**
   - Users can still access the app when offline
   - Cached resources are served when network is unavailable

### 4. Update Strategy Details

The service worker uses different caching strategies:

- **HTML files:** Network-first (always tries to get latest from server)
- **Static assets (CSS, JS, images):** Cache-first (fast loading from cache)

This ensures users get updates while maintaining good performance.

### 5. Testing Updates Locally

To test the update mechanism locally:

1. Start a local web server in the `src` directory
2. Open the app in a browser
3. Change the `CACHE_VERSION` in service-worker.js
4. Reload the page
5. You should see the update notification banner

### Troubleshooting

**Problem:** Users not getting updates on their phones

**Solution:**
- Ensure you updated `CACHE_VERSION` before deploying
- Users may need to force-reload the page (varies by browser)
- Clear service worker cache in browser dev tools if testing
- On phones, closing and reopening the browser may help

**Problem:** Update banner shows every time

**Solution:**
- Make sure `CACHE_VERSION` is the same across all deployments of the same version
- Only change it when you actually deploy new code

## Technical Details

The fix implements:

1. **Versioned Cache Names:** Cache name includes version, forcing cache invalidation
2. **Immediate Activation:** `self.skipWaiting()` activates new service worker immediately
3. **Network-First for HTML:** Ensures latest HTML is fetched when online
4. **Cache-First for Assets:** Maintains performance for static resources
5. **Offline Fallback:** Cached content serves as fallback when offline
