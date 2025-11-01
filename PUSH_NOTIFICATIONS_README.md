# Push Notifications Feature

This document describes the push notification feature implemented in the Micro-Me habit tracking application.

## Overview

The app now sends push notifications to users who haven't completed all their daily habits. Notifications are sent automatically every day at 8 PM UTC.

## Architecture

### Mobile App (React Native)

**Key Components:**

1. **Notification Service** (`mobile/src/services/notifications.ts`)
   - Handles permission requests
   - Manages FCM token registration
   - Displays foreground notifications
   - Listens for notification events

2. **AuthContext Integration** (`mobile/src/context/AuthContext.tsx`)
   - Initializes notifications on login
   - Unregisters FCM token on logout

**Features:**
- ✅ Request notification permissions (iOS & Android)
- ✅ Get and register FCM tokens with backend
- ✅ Handle token refresh
- ✅ Display notifications when app is in foreground
- ✅ Handle notification taps (background/killed state)
- ✅ Automatic notification setup on user login
- ✅ Token cleanup on logout

### Backend API (NestJS)

**Key Components:**

1. **Notifications Module** (`api/src/notifications/`)
   - `notifications.controller.ts` - API endpoints
   - `notifications.service.ts` - Business logic
   - `notifications.module.ts` - Module configuration

2. **User Schema** (`api/src/schemas/user.schema.ts`)
   - Stores user FCM tokens (supports multiple devices)

**Features:**
- ✅ Register/unregister FCM tokens
- ✅ Store multiple tokens per user (multi-device support)
- ✅ Send notifications via Firebase Admin SDK
- ✅ Automatic cleanup of invalid tokens
- ✅ Scheduled cron job (daily at 8 PM UTC)
- ✅ Check for incomplete habits
- ✅ Send personalized reminders

## API Endpoints

### POST `/api/notifications/register-token`
Register an FCM token for the authenticated user.

**Request:**
```json
{
  "fcmToken": "string"
}
```

**Response:**
```json
{
  "message": "FCM token registered successfully"
}
```

### POST `/api/notifications/unregister-token`
Unregister an FCM token for the authenticated user.

**Request:**
```json
{
  "fcmToken": "string"
}
```

**Response:**
```json
{
  "message": "FCM token unregistered successfully"
}
```

### POST `/api/notifications/test-notification`
Manually trigger the notification check (for testing).

**Response:**
```json
{
  "message": "Notification check triggered"
}
```

## How It Works

### 1. User Login Flow

```
1. User logs in
2. AuthContext detects authentication
3. initializeNotifications() is called
4. App requests notification permission
5. FCM token is obtained
6. Token is sent to backend API
7. Backend stores token in User collection
```

### 2. Scheduled Notification Flow

```
Every day at 8 PM UTC:
1. Cron job triggers checkIncompleteHabitsAndNotify()
2. Fetch all users with registered FCM tokens
3. For each user:
   a. Get user's habits
   b. Get today's completed entries
   c. Calculate incomplete habits
   d. If any incomplete, send notification
4. Clean up invalid tokens
```

### 3. Notification Message

**Title:** ⏰ Habit Reminder

**Body:** You have {X} incomplete habit(s) today. Don't break your streak!

## Configuration

### Required Packages

**Mobile:**
- `@react-native-firebase/app` - Firebase core
- `@react-native-firebase/messaging` - Firebase Cloud Messaging
- `@notifee/react-native` - Local notification display

**Backend:**
- `@nestjs/schedule` - Cron job scheduling
- `firebase-admin` - Firebase Admin SDK (already installed)

### Android Configuration

1. **Permissions** (`mobile/android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

2. **Google Services** - Already configured in `google-services.json`

### iOS Configuration

1. **Capabilities** - Push Notifications capability should be enabled in Xcode
2. **APNs Certificate** - Must be configured in Firebase Console
3. **GoogleService-Info.plist** - Already configured

## Customization

### Change Notification Time

Edit the cron expression in `api/src/notifications/notifications.service.ts`:

```typescript
@Cron('0 20 * * *', {  // Current: 8 PM UTC
  timeZone: 'UTC',
})
```

Cron format: `minute hour day month dayOfWeek`

Examples:
- `'0 12 * * *'` - 12 PM UTC daily
- `'0 18 * * *'` - 6 PM UTC daily
- `'0 9,18 * * *'` - 9 AM and 6 PM UTC daily

### Change Notification Message

Edit in `api/src/notifications/notifications.service.ts`:

```typescript
const title = '⏰ Habit Reminder';
const body = `You have ${incompleteHabits.length} incomplete habit${incompleteHabits.length > 1 ? 's' : ''} today. Don't break your streak!`;
```

### Notification Channel (Android)

Customize the channel in `mobile/src/services/notifications.ts`:

```typescript
const channelId = await notifee.createChannel({
  id: 'habit-reminders',
  name: 'Habit Reminders',
  importance: AndroidImportance.HIGH,
  sound: 'default',
});
```

## Testing

### Test Notifications Manually

1. **From Mobile App:**
   - The app automatically registers tokens on login
   - Check console logs to see token registration

2. **From Backend:**
   - Call the test endpoint:
   ```bash
   curl -X POST https://micro-me-mono.onrender.com/api/notifications/test-notification \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Verify Token Registration:**
   - Check MongoDB User collection for FCM tokens
   ```javascript
   db.users.find({ userId: "YOUR_FIREBASE_UID" })
   ```

### Test Incomplete Habits

1. Create habits in the app
2. Leave some incomplete
3. Trigger the notification check:
   - Wait until 8 PM UTC, OR
   - Call `/api/notifications/test-notification` endpoint

## Troubleshooting

### Notifications Not Received

1. **Check Permissions:**
   - Verify notification permissions are granted in device settings
   - Check console logs for permission errors

2. **Check FCM Token:**
   - Look for "FCM Token:" in console logs
   - Verify token is registered in backend (check User collection)

3. **Check Backend Logs:**
   - Look for "Notification sent successfully" messages
   - Check for any error messages in the notification service

4. **Firebase Console:**
   - Verify Firebase project is correctly configured
   - Check for any quota limits or service issues

### Invalid Token Errors

- The system automatically removes invalid tokens
- Users may need to log out and log back in to refresh tokens

### Notifications Not Triggering

1. **Check Cron Job:**
   - Verify ScheduleModule is imported in AppModule
   - Check server logs for "Starting incomplete habits check..."

2. **Check Timezone:**
   - Cron runs in UTC by default
   - Convert to your local timezone to verify timing

## Future Enhancements

Potential improvements:
- [ ] Customizable notification times per user
- [ ] Different notification frequencies (daily, hourly reminders)
- [ ] Rich notifications with habit details
- [ ] Notification preferences in app settings
- [ ] Weekly summary notifications
- [ ] Streak milestone notifications
- [ ] In-app notification history

## Security Considerations

- FCM tokens are stored securely in MongoDB
- Tokens are automatically removed on logout
- Invalid tokens are cleaned up automatically
- All API endpoints are protected by AuthGuard
- Tokens are encrypted in transit (HTTPS)

## Performance

- Token registration is asynchronous and non-blocking
- Notification sending is batched (sendEachForMulticast)
- Invalid tokens are cleaned up to prevent waste
- Cron job processes users sequentially to avoid overload
- Database queries are optimized with proper indexes

## Monitoring

Key metrics to monitor:
- Number of users with registered tokens
- Notification success/failure rates
- Invalid token cleanup frequency
- Cron job execution time
- User engagement after notifications

Check logs for these patterns:
- `"FCM token registered for user"` - Successful registration
- `"Notification sent successfully"` - Successful notification
- `"Removed X invalid tokens"` - Token cleanup
- `"Starting incomplete habits check"` - Cron job started

## Support

For issues or questions:
1. Check console logs for errors
2. Verify Firebase configuration
3. Test with the manual trigger endpoint
4. Check MongoDB for token storage

---

**Last Updated:** November 1, 2025

