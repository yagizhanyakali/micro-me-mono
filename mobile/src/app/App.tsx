import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { TabNavigator } from '../navigation/TabNavigator';
import 'react-native-gesture-handler';

export const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
