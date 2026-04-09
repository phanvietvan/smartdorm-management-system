import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from '../pages/LandingPage';
import RoomsAvailable from '../screens/RoomsAvailable';
import LoginScreen from '../screens/auth/LoginScreen';
import RoomDetailScreen from '../screens/rooms/RoomDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Home" component={LandingPage} />
      <Stack.Screen name="Rooms" component={RoomsAvailable} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
