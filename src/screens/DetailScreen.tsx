import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { getCoinDetail } from '../services/coinService';
import { CoinDetail } from '../types/coin';
import { addFavorite, removeFavorite, subscribeToFavorites } from '../services/userService';
import { useAuth } from '../context/AuthContext';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

const DetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation();
  const { coinId } = route.params;
  const { user } = useAuth();

  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Açıklama metni için

  useEffect(() => {
    navigation.setOptions({ title: coinId.toUpperCase() });
    fetchDetail();
  }, [coinId]);

  const fetchDetail = async () => {
    try {
      const data = await getCoinDetail(coinId);
      setCoin(data);
    } catch (error) {
      Alert.alert('Hata', 'Coin detayları alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToFavorites(user.uid, (favs) => {
      const exists = favs.some((c: any) => c.id === coinId);
      setIsFavorite(exists);
    });
    return () => unsubscribe();
  }, [user, coinId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleToggleFavorite} style={{ marginRight: 10 }}>
          <Text style={{ fontSize: 24 }}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isFavorite, coin]);

  const handleToggleFavorite = async () => {
    if (!user || !coin) return;
    try {
      if (isFavorite) {
        await removeFavorite(user.uid, coin.id);
      } else {
        await addFavorite(user.uid, coin);
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
    }
  };

  const removeHtmlTags = (str: string) => {
    if (!str) return '';
    return str.replace(/<[^>]*>?/gm, '');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!coin) {
    return (
      <View style={styles.center}>
        <Text>Veri bulunamadı.</Text>
      </View>
    );
  }

  const isUp = coin.market_data.price_change_percentage_24h > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: coin.image.large }} style={styles.image} />
        <Text style={styles.name}>{coin.name}</Text>
        <Text style={styles.symbol}>{coin.symbol.toUpperCase()}</Text>
      </View>

      {/* Fiyat */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          ${coin.market_data.current_price.usd.toLocaleString()}
        </Text>
        <View style={[styles.badge, { backgroundColor: isUp ? '#e8f5e9' : '#ffebee' }]}>
          <Text style={[styles.changeText, { color: isUp ? '#4caf50' : '#f44336' }]}>
            {isUp ? '▲' : '▼'} {coin.market_data.price_change_percentage_24h.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* İstatistikler */}
      <Text style={styles.sectionTitle}>Piyasa İstatistikleri</Text>
      <View style={styles.statsContainer}>
        <StatCard title="Piyasa Değeri" value={`$${coin.market_data.market_cap.usd.toLocaleString()}`} />
        <StatCard title="24s En Yüksek" value={`$${coin.market_data.high_24h.usd.toLocaleString()}`} />
        <StatCard title="24s En Düşük" value={`$${coin.market_data.low_24h.usd.toLocaleString()}`} />
      </View>

      {/* Açıklama */}
      <Text style={styles.sectionTitle}>Hakkında</Text>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {isExpanded 
            ? removeHtmlTags(coin.description.en) 
            : removeHtmlTags(coin.description.en).substring(0, 300) + (coin.description.en.length > 300 ? '...' : '')}
        </Text>
        
        {removeHtmlTags(coin.description.en).length > 300 && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>
              {isExpanded ? 'Daha Az Göster' : 'Devamını Oku'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value }: { title: string, value: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 20 },
  image: { width: 80, height: 80, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  symbol: { fontSize: 16, color: '#888' },
  priceContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  price: { fontSize: 32, fontWeight: '800', color: '#333', marginRight: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  changeText: { fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginTop: 24, marginBottom: 12, color: '#333' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  statCard: { width: '31%', backgroundColor: '#f8f9fa', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  statTitle: { fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },
  descriptionContainer: { paddingHorizontal: 16, marginBottom: 20 },
  description: { fontSize: 14, color: '#555', lineHeight: 22 },
  readMoreButton: { marginTop: 8, alignSelf: 'flex-start' },
  readMoreText: { color: '#2196F3', fontWeight: 'bold', fontSize: 14 },
});

export default DetailScreen;