import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';

import { RootStackParamList } from '../types/navigation';
import { getMarketCoins } from '../services/coinService';
import { Coin } from '../types/coin';
import CoinItem from '../components/CoinItem';
import { auth } from '../config/firebase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [coins, setCoins] = useState<Coin[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Arama State'i
  const [searchQuery, setSearchQuery] = useState('');

  // Çıkış Butonu Ayarı (Header)
  useEffect(() => {
    navigation.setOptions({
      title: 'Piyasalar',
      headerRight: () => (
        <TouchableOpacity onPress={() => signOut(auth)} style={{ marginRight: 10 }}>
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadData = async (pageNum: number, shouldRefresh: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setHasError(false);

    try {
      const data = await getMarketCoins(pageNum);
      
      if (shouldRefresh) {
        setCoins(data);
      } else {
        setCoins(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueNewData = data.filter(c => !existingIds.has(c.id));
          return [...prev, ...uniqueNewData];
        });
      }
      setPage(pageNum);
    } catch (error: any) {
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
    loadData(1, true);
  }, []);

  const handleLoadMore = () => {
    // Eğer arama yapılıyorsa veya hata varsa yeni sayfa yükleme
    if (!loading && !hasError && searchQuery.length === 0) {
      loadData(page + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasError(false);
    setSearchQuery(''); // Yenilerken aramayı temizle
    loadData(1, true);
  }, []);

  const handlePress = useCallback((coinId: string) => {
    navigation.navigate('Detail', { coinId });
  }, [navigation]);

  // Arama Filtreleme Mantığı
  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Coin }) => (
    <CoinItem coin={item} onPress={handlePress} />
  );

  const renderFooter = () => {
    if (hasError) return <Text style={styles.errorText}>Çok hızlı işlem yapıldı. Bekleyin.</Text>;
    if (loading && coins.length > 0) return <ActivityIndicator style={{ padding: 20 }} size="small" color="#2196F3" />;
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      
      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Coin ara (örn: Bitcoin)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCoins}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2196F3" />
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Sonuç bulunamadı.</Text> : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 10, 
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  errorText: { color: 'red', textAlign: 'center', padding: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' }
});

export default HomeScreen;