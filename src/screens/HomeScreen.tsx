import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
// DÜZELTME 1: SafeAreaView'i buradan import ediyoruz (Hata gidecek)
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getMarketCoins } from '../services/coinService';
import { Coin } from '../types/coin';
import CoinItem from '../components/CoinItem';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Button } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [coins, setCoins] = useState<Coin[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false); // Hata durumu kontrolü

  const loadData = async (pageNum: number, shouldRefresh: boolean = false) => {
    // Eğer zaten yükleniyorsa veya hata aldıysak (429) tekrar deneme (Koruma)
    if (loading) return;
    
    setLoading(true);
    setHasError(false);

    try {
      const data = await getMarketCoins(pageNum);
      
      if (shouldRefresh) {
        setCoins(data);
      } else {
        // Eski verilerin üzerine ekle, ama aynı ID'li veri varsa ekleme (Duplicate key hatasını önler)
        setCoins(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueNewData = data.filter(c => !existingIds.has(c.id));
          return [...prev, ...uniqueNewData];
        });
      }
      setPage(pageNum);
    } catch (error: any) {
      // 429 hatasını özel olarak yakala
      if (error.response && error.response.status === 429) {
        console.warn("API Kotası Doldu! Biraz bekleyin.");
        setHasError(true); 
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Piyasalar', // Başlığı da güzelleştirelim
      headerRight: () => (
        <TouchableOpacity onPress={() => signOut(auth)} style={{ marginRight: 10 }}>
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  useEffect(() => {
    loadData(1, true);
  }, []);

  const handleLoadMore = () => {
    // Hata varsa veya yükleniyorsa yeni istek atma
    if (!loading && !hasError) {
      loadData(page + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasError(false); // Yenileyince hatayı sıfırla
    loadData(1, true);
  }, []);

  const handlePress = useCallback((coinId: string) => {
    navigation.navigate('Detail', { coinId });
  }, [navigation]);

  const renderItem = ({ item }: { item: Coin }) => (
    <CoinItem coin={item} onPress={handlePress} />
  );

  const renderFooter = () => {
    if (hasError) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>Çok hızlı işlem yapıldı. Lütfen bekleyin.</Text>
        </View>
      );
    }
    if (loading && coins.length > 0) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator size="small" color="#2196F3" />
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={coins}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        // DÜZELTME 2: Threshold'u biraz düşürdük, kullanıcı tam dibe gelince yüklesin ki API şişmesin
        onEndReachedThreshold={0.2} 
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2196F3" />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
});

export default HomeScreen;