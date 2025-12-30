import axios from 'axios';
import { Coin } from '../types/coin';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('API URL is not defined in .env file');
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 saniye içinde cevap gelmezse hata ver
});

export const getMarketCoins = async (): Promise<Coin[]> => {
  try {
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Hatası:', error);
    // Hatayı yukarı fırlat ki UI tarafında kullanıcıya "Hata oldu" diyebilelim
    throw error;
  }
};