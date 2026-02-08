import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AddTripScreen from '../screens/AddTripScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import TripsScreen from '../screens/TripsScreen';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: COLORS.primary }}>
    <Tab.Screen
      name="TripsTab"
      component={TripsScreen}
      options={{ tabBarLabel: 'Trips', tabBarIcon: ({ color }) => <Ionicons name="car" size={24} color={color} /> }}
    />
    <Tab.Screen
      name="AddTrip"
      component={AddTripScreen}
      options={{ tabBarLabel: 'Log Trip', tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} /> }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }}
    />
  </Tab.Navigator>
);

export default function AppNavigator({ hasProfile }: { hasProfile: boolean }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {hasProfile ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Setup" component={ProfileSetupScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}