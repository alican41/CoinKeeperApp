import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { addFavorite, removeFavorite, subscribeToFavorites } from '../services/userService';
import { useAuth } from '../context/AuthContext';
// Hook'larımızı çağırıyoruz
import { useCoinDetail, useCoinMarketChart } from '../hooks/useCoins';
// Grafik kütüphanesi
import { LineChart } from 'react-native-gifted-charts';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

// Ekran genişliğini alıyoruz (Grafiği ekrana sığdırmak için)
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation();
  const { coinId } = route.params;
  const { user } = useAuth();

  // --- 1. VERİ ÇEKME (TanStack Query) ---
  // Coin Detay Verisi
  const { data: coin, isLoading, isError, error } = useCoinDetail(coinId);
  
  // Grafik Verisi (Ayrı çekiyoruz ki grafik yüklenirken detaylar beklemesin)
  const { data: chartData, isLoading: isChartLoading } = useCoinMarketChart(coinId);

  // Local State'ler
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // --- 2. GRAFİK VERİSİNİ FORMATLAMA ---
  // API'den gelen [zaman, fiyat] dizisini -> {value: fiyat, date: saat} formatına çeviriyoruz
  const formattedChartData = chartData?.map(([timestamp, price]) => ({
    value: price,
    date: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })) || [];

  // Coin artışta mı? (Rengi belirlemek için)
  const isUp = coin?.market_data.price_change_percentage_24h && coin.market_data.price_change_percentage_24h > 0;
  const chartColor = isUp ? '#4caf50' : '#f44336'; // Yeşil veya Kırmızı

  // --- 3. HEADER AYARLARI ---
  useEffect(() => {
    navigation.setOptions({ title: coinId.toUpperCase() });
  }, [coinId]);

  // Sağ üst köşe Kalp butonu
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleToggleFavorite} style={{ marginRight: 10 }}>
          <Text style={{ fontSize: 24 }}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isFavorite, coin]);

  // --- 4. FAVORİ İŞLEMLERİ (Firebase) ---
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToFavorites(user.uid, (favs) => {
      const exists = favs.some((c: any) => c.id === coinId);
      setIsFavorite(exists);
    });
    return () => unsubscribe();
  }, [user, coinId]);

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

  // HTML taglerini temizleyen yardımcı fonksiyon
  const removeHtmlTags = (str: string) => str ? str.replace(/<[^>]*>?/gm, '') : '';

  // --- 5. RENDER (GÖRÜNÜM) ---

  // Yükleniyor...
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Hata Varsa (Örn: API Kotası dolduysa)
  if (isError || !coin) {
    console.error("Detay Hatası:", error); // Terminale hatayı bas
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: '#333' }}>Veri yüklenemedi.</Text>
        <Text style={{ fontSize: 12, color: 'red', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
          {(error as any)?.message || "Bilinmeyen bir hata oluştu."}
        </Text>
        {/* API Limit hatasıysa (429) kullanıcıya bilgi ver */}
        {((error as any)?.message?.includes('429') || (error as any)?.response?.status === 429) && (
          <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
            API kullanım limiti doldu. Lütfen 1 dakika bekleyip tekrar deneyin.
          </Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header: Logo ve İsim */}
      <View style={styles.header}>
        <Image source={{ uri: coin.image.large }} style={styles.image} />
        <Text style={styles.name}>{coin.name}</Text>
        <Text style={styles.symbol}>{coin.symbol.toUpperCase()}</Text>
      </View>

      {/* Fiyat Bloğu */}
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

      {/* --- GRAFİK BÖLÜMÜ --- */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Son 24 Saatlik Değişim</Text>
        
        {isChartLoading ? (
          <View style={{ height: 220, justifyContent: 'center' }}>
            <ActivityIndicator size="small" color="#2196F3" />
          </View>
        ) : formattedChartData.length > 0 ? (
          <View style={{ marginLeft: -20 }}> 
            {/* marginLeft -20: Grafik kütüphanesinin sol boşluğunu dengelemek için */}
            <LineChart
              data={formattedChartData}
              height={220}
              width={SCREEN_WIDTH + 20}
              spacing={2}
              initialSpacing={0}
              color={chartColor}
              thickness={2}
              hideDataPoints
              hideRules
              hideYAxisText
              hideAxesAndRules
              // Grafiği dikeyde ortalamak için en düşük değerden başlatıyoruz
              yAxisOffset={Math.min(...formattedChartData.map(d => d.value)) * 0.99}
              
              // Dokunmatik İmleç (Tooltip) Ayarları
              pointerConfig={{
                pointerStripHeight: 160,
                pointerStripColor: 'lightgray',
                pointerStripWidth: 2,
                pointerColor: 'lightgray',
                radius: 6,
                pointerLabelWidth: 100,
                pointerLabelHeight: 90,
                activatePointersOnLongPress: false,
                autoAdjustPointerLabelPosition: false,
                pointerLabelComponent: items => {
                  return (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>
                        ${items[0].value.toFixed(2)}
                      </Text>
                      <Text style={styles.tooltipDate}>
                        {items[0].date}
                      </Text>
                    </View>
                  );
                },
              }}
            />
          </View>
        ) : (
          <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#888' }}>Grafik verisi alınamadı.</Text>
          </View>
        )}
      </View>

      {/* İstatistik Grid Yapısı */}
      <Text style={styles.sectionTitle}>Piyasa İstatistikleri</Text>
      <View style={styles.statsContainer}>
        <StatCard title="Piyasa Değeri" value={`$${coin.market_data.market_cap.usd.toLocaleString()}`} />
        <StatCard title="24s En Yüksek" value={`$${coin.market_data.high_24h.usd.toLocaleString()}`} />
        <StatCard title="24s En Düşük" value={`$${coin.market_data.low_24h.usd.toLocaleString()}`} />
      </View>

      {/* Açıklama Metni (Expandable) */}
      <Text style={styles.sectionTitle}>Hakkında</Text>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {isExpanded 
            ? removeHtmlTags(coin.description.en) 
            : removeHtmlTags(coin.description.en).substring(0, 300) + (coin.description.en.length > 300 ? '...' : '')}
        </Text>
        
        {removeHtmlTags(coin.description.en).length > 300 && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>{isExpanded ? 'Daha Az Göster' : 'Devamını Oku'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

// Küçük Bilgi Kartı Bileşeni
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
  
  chartContainer: { marginTop: 20, marginBottom: 10 },
  tooltip: {
    height: 60, width: 100, backgroundColor: '#333', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginLeft: -40
  },
  tooltipText: { color: 'white', fontWeight: 'bold' },
  tooltipDate: { color: 'lightgray', fontSize: 10 },
  
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