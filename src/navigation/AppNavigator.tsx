import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Sayfalarımızı import edelim
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import { RootStackParamList, RootTabParamList } from '../types/navigation';

// 1. Önce Tab Yapısını kuralım (Home ve Favorites)
const Tab = createBottomTabNavigator<RootTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* Favorites ekranını henüz yapmadık, geçici olarak Home'u koyuyorum hata vermesin */}
      <Tab.Screen name="Favorites" component={HomeScreen} /> 
    </Tab.Navigator>
  );
}

// 2. Şimdi Ana Stack Yapısını kuralım
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Ana ekranımız Tab yapısı olacak */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }} // Tab başlığı zaten var, Stack başlığını gizle
        />
        {/* Detay sayfası stack'in üzerine gelecek (modal gibi açılır veya kayarak gelir) */}
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}