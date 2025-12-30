import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, SafeAreaView, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { subscribeToFavorites } from '../services/userService';
import { getCoinsByIds } from '../services/coinService'; // Yeni yazdığımız fonksiyon
import CoinItem from '../components/CoinItem';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Coin } from '../types/coin';

const FavoritesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // firestoreData: Veritabanındaki kayıtlı (eski fiyatlı) veri
  const [firestoreData, setFirestoreData] = useState<any[]>([]);
  // displayData: Ekrana basacağımız (güncel fiyatlı) veri
  const [displayData, setDisplayData] = useState<Coin[]>([]);
  
  const [refreshing, setRefreshing] = useState(false);

  // 1. Adım: Firestore'u Dinle (Hangi coinler favori?)
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToFavorites(user.uid, (data) => {
      setFirestoreData(data);
      // İlk başta Firestore verisini göster (Hızlı açılış için)
      // Daha sonra API'den günceli gelince değişecek.
      setDisplayData(data); 
      
      // ID listesini çıkarıp güncel fiyatları iste
      const ids = data.map(item => item.id);
      fetchFreshPrices(ids);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Adım: Güncel Fiyatları Çekme Fonksiyonu
  const fetchFreshPrices = async (ids: string[]) => {
    console.log("--- API GÜNCELLEMESİ BAŞLIYOR ---");
    console.log("İstenen ID'ler:", ids);

    if (ids.length === 0) {
      console.log("Liste boş, istek atılmıyor.");
      setDisplayData([]);
      return;
    }

    try {
      // Servis fonksiyonunun içini de loglayalım
      const freshCoins = await getCoinsByIds(ids);
      
      console.log("API Cevabı Geldi. Coin Sayısı:", freshCoins.length);
      
      if (freshCoins.length > 0) {
        console.log("Örnek Fiyat (API):", freshCoins[0].current_price);
        console.log("Örnek Fiyat (Firestore):", firestoreData[0]?.current_price);
        
        // State'i güncelle
        setDisplayData(freshCoins);
      } else {
        console.log("API boş veri döndü!");
      }

    } catch (error: any) {
      // Hatanın detayını görelim
      console.error("!!! API HATASI !!!");
      if (error.response) {
        console.error("Status Code:", error.response.status); // 429 ise limit dolmuştur
        console.error("Hata Mesajı:", error.response.data);
      } else {
        console.error("Hata:", error.message);
      }
      
      console.log("Eski fiyatlar gösterilmeye devam ediliyor.");
    }
  };

  // Pull-to-Refresh (Elle güncellemek isterse)
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorilerim</Text>
      </View>
      
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 }
});

export default FavoritesScreen;