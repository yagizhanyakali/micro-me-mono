import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './app/App';
import messaging from '@react-native-firebase/messaging';

// Register background handler for push notifications
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background message received:', remoteMessage);
});

AppRegistry.registerComponent('Mobile', () => App);
