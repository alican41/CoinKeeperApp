import axios from 'axios';
import { Coin } from '../types/coin';
import { storage, STORAGE_KEYS } from '../utils/storage'; // Yeni helper'ı çağırdık

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('API URL is not defined in .env file');
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const getMarketCoins = async (page: number = 1): Promise<Coin[]> => {
  try {
    // 1. API'ye istek at
    console.log(`API İsteği atılıyor... Sayfa: ${page}`);
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: page,
        sparkline: false,
      },
    });

    // 2. Başarılıysa veriyi kaydet (Sadece 1. sayfayı cache'lemek mantıklıdır genelde)
    if (page === 1) {
      await storage.save(STORAGE_KEYS.MARKET_COINS, response.data);
      console.log('Veri API\'den geldi ve cachelendi.');
    }

    return response.data;

  } catch (error) {
    // 3. Hata alırsak (İnternet yok veya 429 Limit Hatası)
    console.warn('API Hatası, Cache kontrol ediliyor...');

    if (page === 1) {
      const cachedData = await storage.get(STORAGE_KEYS.MARKET_COINS);
      if (cachedData) {
        console.log('Veri CACHE üzerinden yüklendi.');
        return cachedData;
      }
    }
    
    // Cache de yoksa hatayı fırlat
    throw error;
  }
};