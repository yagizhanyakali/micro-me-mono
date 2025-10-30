import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../screens/TodayScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ focused: boolean; icon: string }> = ({
  focused,
  icon,
}) => {
  return (
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="✓" />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📊" />,
        }}
      />
    </Tab.Navigator>
  );
};

