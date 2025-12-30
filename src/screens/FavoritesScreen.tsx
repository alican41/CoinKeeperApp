import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { subscribeToFavorites } from '../services/userService';
import { getCoinsByIds } from '../services/coinService';
import CoinItem from '../components/CoinItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Coin } from '../types/coin';
// SafeAreaView'i buradan almaya devam et
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  
  const [firestoreData, setFirestoreData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<Coin[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToFavorites(user.uid, (data) => {
      setFirestoreData(data);
      setDisplayData(data); 
      
      const ids = data.map(item => item.id);
      fetchFreshPrices(ids);
    });

    return () => unsubscribe();
  }, [user]);

  const fetchFreshPrices = async (ids: string[]) => {
    // Logları temizledim, kodun daha temiz dursun
    if (ids.length === 0) {
      setDisplayData([]);
      return;
    }

    try {
      const freshCoins = await getCoinsByIds(ids);
      if (freshCoins.length > 0) {
        setDisplayData(freshCoins);
      }
    } catch (error: any) {
      console.log("Eski fiyatlar gösterilmeye devam ediliyor.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const ids = firestoreData.map(item => item.id);
    await fetchFreshPrices(ids);
    setRefreshing(false);
  };

  const handlePress = (coinId: string) => {
    navigation.navigate('Detail', { coinId });
  };

  return (
    // DÜZELTME BURADA: edges prop'u ile 'top' değerini çıkardık.
    // Böylece üstteki gereksiz boşluk (StatusBar koruması) kalktı.
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
    
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CoinItem coin={item} onPress={handlePress} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz favori coin eklemediniz.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2196F3" />
        }
        // Ekstra: Listenin en tepesine minik bir boşluk verelim ki tamamen yapışmasın (Estetik)
        contentContainerStyle={{ paddingTop: 10 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 }
});

export default FavoritesScreen;