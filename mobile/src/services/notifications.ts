import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Update this URL based on your development environment
// For iOS simulator: http://localhost:3000/api
// For Android emulator: http://10.0.2.2:3000/api
// For physical device: http://YOUR_COMPUTER_IP:3000/api
// For production: https://micro-me-mono.onrender.com/api
const API_BASE_URL = 'http://10.0.2.2:3000/api';

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } else {
      // For Android, request permission through Notifee for better control
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Check if notification permissions are granted
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } else {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
    }
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}

/**
 * Get the FCM token for this device
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission, requesting...');
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log('Notification permission denied');
        return null;
      }
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Register FCM token with the backend
 */
export async function registerFCMToken(token: string): Promise<void> {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      console.log('No user token found, skipping FCM token registration');
      return;
    }

    await axios.post(
      `${API_BASE_URL}/notifications/register-token`,
      { fcmToken: token },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Store locally that we've registered this token
    await AsyncStorage.setItem('fcmToken', token);
    console.log('FCM token registered successfully');
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
}

/**
 * Initialize notification listeners
 */
export function setupNotificationListeners() {
  // Handle token refresh
  messaging().onTokenRefresh(async (token) => {
    console.log('FCM token refreshed:', token);
    await registerFCMToken(token);
  });

  // Handle foreground notifications
  messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification received:', remoteMessage);
    await displayNotification(remoteMessage);
  });

  // Handle notification opened when app is in background
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened app from background:', remoteMessage);
    // You can navigate to specific screen here if needed
  });

  // Check if app was opened from a notification (when app was completely closed)
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('App opened from notification (killed state):', remoteMessage);
        // You can navigate to specific screen here if needed
      }
    });
}

/**
 * Display a notification using Notifee
 */
async function displayNotification(remoteMessage: { notification?: { title?: string; body?: string } }) {
  try {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'habit-reminders',
      name: 'Habit Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    // Display the notification
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Habit Reminder',
      body: remoteMessage.notification?.body || 'Don\'t forget to complete your habits!',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
}

/**
 * Initialize notifications - call this when the app starts
 */
export async function initializeNotifications(): Promise<void> {
  try {
    // Setup listeners
    setupNotificationListeners();

    // Check if user is logged in
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      console.log('No user logged in, skipping notification setup');
      return;
    }

    // Get and register FCM token
    const fcmToken = await getFCMToken();
    if (fcmToken) {
      await registerFCMToken(fcmToken);
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

/**
 * Unregister FCM token when user logs out
 */
export async function unregisterFCMToken(): Promise<void> {
  try {
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    const userToken = await AsyncStorage.getItem('userToken');
    
    if (fcmToken && userToken) {
      await axios.post(
        `${API_BASE_URL}/notifications/unregister-token`,
        { fcmToken },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      await AsyncStorage.removeItem('fcmToken');
      console.log('FCM token unregistered successfully');
    }
  } catch (error) {
    console.error('Error unregistering FCM token:', error);
  }
}

/**
 * Send a test notification
 */
export async function sendTestNotification(): Promise<void> {
  try {
    await displayNotification({
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from Habit Tracker!',
      },
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

