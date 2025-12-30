import AsyncStorage from '@react-native-async-storage/async-storage';

// Mülakat Notu: Key'leri sabitlerde tutmak, yazım hatalarını önler.
export const STORAGE_KEYS = {
  MARKET_COINS: 'MARKET_COINS_CACHE',
};

export const storage = {
  // Veri Kaydetme
  save: async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value); // Nesneyi String'e çevir
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Storage Save Error:', e);
    }
  },

  // Veri Okuma
  get: async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null; // String'i Nesneye çevir
    } catch (e) {
      console.error('Storage Get Error:', e);
      return null;
    }
  },

  // Veri Silme (Gerekirse)
  remove: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Storage Remove Error:', e);
    }
  }
};