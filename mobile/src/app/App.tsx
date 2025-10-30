import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';
import { TabNavigator } from '../navigation/TabNavigator';
import 'react-native-gesture-handler';

export const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#1a1a1a"
        translucent={false}
      />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default App;
