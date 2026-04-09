import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Receipt, User, Search } from 'lucide-react-native';
import DashboardScreen from '../screens/DashboardScreen';
import BillsScreen from '../screens/BillsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RoomsAvailable from '../screens/RoomsAvailable';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={RoomsAvailable} 
        options={{
          tabBarLabel: 'Tìm phòng',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Bills" 
        component={BillsScreen} 
        options={{
          tabBarLabel: 'Hóa đơn',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
