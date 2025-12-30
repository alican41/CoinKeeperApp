import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Coin } from '../types/coin';

// Component'e dışarıdan gelecek verilerin tipini belirliyoruz
interface CoinItemProps {
  coin: Coin;
  onPress: (id: string) => void;
}

const CoinItem = ({ coin, onPress }: CoinItemProps) => {
  // Fiyat değişimine göre renk belirleme (Yeşil/Kırmızı)
  const isUp = coin.price_change_percentage_24h > 0;
  const priceColor = isUp ? '#4caf50' : '#f44336';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(coin.id)}
      activeOpacity={0.7}
    >
      {/* Sol Taraf: Resim ve İsimler */}
      <View style={styles.leftWrapper}>
        <Image source={{ uri: coin.image }} style={styles.image} />
        <View style={styles.titlesWrapper}>
          <Text style={styles.title}>{coin.name}</Text>
          <Text style={styles.symbol}>{coin.symbol.toUpperCase()}</Text>
        </View>
      </View>

      {/* Sağ Taraf: Fiyat ve Yüzde */}
      <View style={styles.rightWrapper}>
        <Text style={styles.title}>
          ${coin.current_price.toLocaleString()}
        </Text>
        <Text style={[styles.subtitle, { color: priceColor }]}>
          {isUp ? '▲' : '▼'} {coin.price_change_percentage_24h?.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  leftWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 40,
    width: 40,
    marginRight: 12,
    borderRadius: 20, // Yuvarlak resim
  },
  titlesWrapper: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  symbol: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  rightWrapper: {
    alignItems: 'flex-end',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

// React.memo ile sarmalıyoruz (Performans Optimizasyonu)
export default memo(CoinItem);