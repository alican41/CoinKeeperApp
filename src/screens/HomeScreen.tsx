import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getMarketCoins } from '../services/coinService'; // Servisi çağırdık
import { Coin } from '../types/coin'; // Tipi çağırdık

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // State tanımları (Mülakatta generic tipleri <Coin[]> belirtmek önemli!)
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sayfa açıldığında çalışacak kod
  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const data = await getMarketCoins();
      console.log('Gelen Veri (İlk Coin):', data[0]); // Konsolda görelim
      setCoins(data);
    } catch (error) {
      console.error('Veri çekilemedi');
    } finally {
      setLoading(false); // Hata olsa da olmasa da yükleniyor ikonunu kapat
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text>Coin Sayısı: {coins.length}</Text>
          <Text>İlk Coin: {coins[0]?.name} - ${coins[0]?.current_price}</Text>
          
          <Button 
            title="Detaya Git" 
            onPress={() => navigation.navigate('Detail', { coinId: coins[0]?.id || 'bitcoin' })} 
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default HomeScreen;