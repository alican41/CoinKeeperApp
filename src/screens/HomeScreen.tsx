import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { RootStackParamList } from '../types/navigation';
import { Coin } from '../types/coin';
import CoinItem from '../components/CoinItem';
import { useMarketCoins } from '../hooks/useCoins';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useMarketCoins();

  const allCoins = data?.pages.flatMap(page => page) || [];

  const filteredCoins = allCoins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Piyasalar',
      headerRight: () => (
        <TouchableOpacity onPress={() => signOut(auth)} style={{ marginRight: 10 }}>
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handlePress = useCallback((coinId: string) => {
    navigation.navigate('Detail', { coinId });
  }, [navigation]);

  const renderItem = ({ item }: { item: Coin }) => (
    <CoinItem coin={item} onPress={handlePress} />
  );

  const renderFooter = () => {
    if (isFetchingNextPage) return <ActivityIndicator style={{ padding: 20 }} size="small" color="#2196F3" />;
    return null;
  };

  if (isError && !allCoins.length) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: 'red', marginBottom: 10 }}>Bir hata oluştu.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={{ color: 'white' }}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // DÜZELTME BURADA: edges={['left', 'right']}
    // 'bottom' değerini sildik. Artık liste Tab Bar'ın hemen üzerinde bitecek.
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Coin ara..."
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

      {isLoading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.center} />
      ) : (
        <FlatList
          data={filteredCoins}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
            if (hasNextPage && !searchQuery) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2196F3" />
          }
          // İsteğe bağlı: En altta çok az bir boşluk olsun ki son eleman tam sınıra yapışmasın
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    marginHorizontal: 15, marginTop: 10, marginBottom: 10, paddingHorizontal: 15,
    borderRadius: 10, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  retryButton: { backgroundColor: '#2196F3', padding: 10, borderRadius: 5 }
});

export default HomeScreen;