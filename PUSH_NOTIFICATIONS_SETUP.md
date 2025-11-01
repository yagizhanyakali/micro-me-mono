# Push Notifications Setup Guide

Quick guide to get push notifications working in your development and production environments.

## Prerequisites

✅ Firebase project is already configured
✅ google-services.json (Android) and GoogleService-Info.plist (iOS) are in place
✅ All necessary packages are installed

## Setup Steps

### 1. iOS Setup

#### a. Install Pods
```bash
cd mobile/ios
pod install
```

#### b. Enable Push Notifications in Xcode

1. Open `mobile/ios/Mobile.xcworkspace` in Xcode
2. Select your project in the navigator
3. Select the "Mobile" target
4. Go to "Signing & Capabilities" tab
5. Click "+ Capability"
6. Add "Push Notifications"
7. Add "Background Modes" capability
8. Check "Remote notifications" under Background Modes

#### c. Configure APNs in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `micro-me-67a19`
3. Go to Project Settings > Cloud Messaging > iOS app configuration
4. Upload your APNs Authentication Key or APNs Certificate
   - For development: Use Apple Development iOS Push Services certificate
   - For production: Use Apple Production iOS Push Services certificate

To generate APNs key:
1. Go to [Apple Developer](https://developer.apple.com/account/resources/authkeys/list)
2. Create a new key with "Apple Push Notifications service (APNs)" enabled
3. Download the .p8 file
4. Upload to Firebase Console

### 2. Android Setup

#### No additional setup required! ✅

The Android configuration is already complete:
- ✅ google-services.json is in place
- ✅ POST_NOTIFICATIONS permission added to AndroidManifest.xml
- ✅ Firebase plugin configured in build.gradle

### 3. Backend Setup

No additional setup required! The backend is already configured with:
- ✅ Firebase Admin SDK
- ✅ Notification module and service
- ✅ Scheduled cron job
- ✅ API endpoints

## Testing

### Test 1: Verify Token Registration

1. **Run the mobile app:**
```bash
cd mobile
npm start
# Then run on iOS: npm run ios
# Or Android: npm run android
```

2. **Login to the app**

3. **Check console logs** for:
```
FCM Token: [long token string]
FCM token registered successfully
```

4. **Verify in MongoDB:**
```javascript
// In MongoDB shell or Compass
db.users.findOne({ userId: "YOUR_FIREBASE_UID" })
// Should show fcmTokens array with your token
```

### Test 2: Test Notification Manually

#### Option A: Using the Test Endpoint

1. **Get your auth token:**
   - Login to the app
   - Check AsyncStorage for 'userToken' (or use dev tools)

2. **Call the test endpoint:**
```bash
curl -X POST https://micro-me-mono.onrender.com/api/notifications/test-notification \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

3. **Check the response:**
```json
{
  "message": "Notification check triggered"
}
```

4. **Expected behavior:**
   - If you have incomplete habits, you'll receive a notification
   - If all habits are complete, no notification is sent

#### Option B: Wait for Scheduled Notification

The cron job runs daily at 8 PM UTC:
- Convert to your timezone to know when to expect it
- Make sure you have some incomplete habits

### Test 3: Foreground Notification

1. **Keep the app open**
2. **Trigger a notification** (using test endpoint or wait for scheduled time)
3. **You should see a notification appear** even with the app in foreground

### Test 4: Background Notification

1. **Background the app** (home button or swipe up)
2. **Trigger a notification**
3. **You should receive a notification**
4. **Tap the notification** to open the app

## Troubleshooting

### iOS: No notifications received

1. **Check device settings:**
   - Settings > Notifications > Mobile
   - Ensure "Allow Notifications" is enabled

2. **Check Xcode console for errors:**
   ```
   [notification] Remote notification failed with error...
   ```

3. **Verify APNs configuration in Firebase Console**

4. **Try deleting and reinstalling the app:**
   ```bash
   cd mobile
   npm run ios -- --reset-cache
   ```

### Android: No notifications received

1. **Check app permissions:**
   - Settings > Apps > Mobile > Notifications
   - Ensure notifications are enabled

2. **Check Logcat for errors:**
   ```bash
   adb logcat | grep -i firebase
   ```

3. **Verify google-services.json is correct**

4. **Clean and rebuild:**
   ```bash
   cd mobile/android
   ./gradlew clean
   cd ..
   npm run android
   ```

### Backend: Notifications not sending

1. **Check server logs:**
   ```
   Starting incomplete habits check...
   Found X users with FCM tokens
   Notification sent successfully...
   ```

2. **Verify Firebase Admin SDK is initialized** in `api/src/config/firebase.config.ts`

3. **Check MongoDB for FCM tokens:**
   ```javascript
   db.users.find({ fcmTokens: { $exists: true, $ne: [] } })
   ```

4. **Test cron job manually:**
   ```bash
   curl -X POST https://micro-me-mono.onrender.com/api/notifications/test-notification \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Development vs Production

### Development

- Notifications work immediately
- Use test endpoint for quick testing
- Check console logs for debugging

### Production

- APNs production certificate required for iOS
- Ensure Firebase project is in production mode
- Monitor notification delivery rates
- Set up error tracking (Sentry, etc.)

## Notification Schedule

Default schedule: **Daily at 8 PM UTC**

To change the schedule, edit `api/src/notifications/notifications.service.ts`:

```typescript
@Cron('0 20 * * *', {  // minute hour day month dayOfWeek
  timeZone: 'UTC',
})
```

Common schedules:
- `'0 9 * * *'` - 9 AM UTC
- `'0 12 * * *'` - 12 PM UTC
- `'0 18 * * *'` - 6 PM UTC
- `'0 9,18 * * *'` - 9 AM and 6 PM UTC

## Firebase Console URLs

- **Project:** https://console.firebase.google.com/project/micro-me-67a19
- **Cloud Messaging:** https://console.firebase.google.com/project/micro-me-67a19/settings/cloudmessaging

## Useful Commands

```bash
# iOS: Reinstall pods
cd mobile/ios && pod install

# iOS: Run with fresh install
cd mobile && npm run ios -- --reset-cache

# Android: Clean build
cd mobile/android && ./gradlew clean

# Check logs (Android)
adb logcat | grep -i firebase

# Check MongoDB users
mongosh "YOUR_MONGODB_URI"
db.users.find()

# Test notification API
curl -X POST https://micro-me-mono.onrender.com/api/notifications/test-notification \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. ✅ Complete iOS setup (APNs configuration)
2. ✅ Test on physical devices (iOS and Android)
3. ✅ Verify scheduled notifications work
4. ✅ Monitor notification delivery
5. 📱 Add notification preferences in app settings (future)
6. 📊 Add analytics for notification engagement (future)

## Support

If you encounter issues:
1. Check console logs (mobile app)
2. Check server logs (backend)
3. Verify Firebase Console configuration
4. Test with manual trigger endpoint
5. Check MongoDB for token storage

---

**Last Updated:** November 1, 2025

