import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // Context'i çektik

import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import LoginScreen from '../screens/LoginScreen'; // Yeni ekran
import { RootStackParamList, RootTabParamList } from '../types/navigation';
import FavoritesScreen from '../screens/FavoritesScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Giriş yapmış kullanıcının göreceği Tab yapısı
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* Favorites daha sonra eklenecek */}
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth(); // Kullanıcı durumunu dinle

  // 1. Durum: Firebase henüz kontrol ediyorsa (Splash Screen)
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // 2. Durum: Giriş YAPILMIŞ -> Uygulama içine al
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Detail" component={DetailScreen} />
          </>
        ) : (
          // 3. Durum: Giriş YAPILMAMIŞ -> Sadece Login ekranını göster
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}