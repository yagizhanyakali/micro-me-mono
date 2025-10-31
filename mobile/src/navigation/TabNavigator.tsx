import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../screens/TodayScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { Text } from 'react-native';

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
        tabBarActiveTintColor: '#5DADE2',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          paddingTop: 8,
          backgroundColor: '#1a1a1a',
          borderTopWidth: 1,
          borderTopColor: '#2a2a2a',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
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
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🏠" />,
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

