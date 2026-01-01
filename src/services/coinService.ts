import axios from 'axios';
import { Coin, CoinDetail } from '../types/coin';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Artık sadece API isteği atıyor, başka hiçbir logic yok!
export const getMarketCoins = async ({ pageParam = 1 }): Promise<Coin[]> => {
  const response = await api.get('/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 20,
      page: pageParam, // React Query'den gelecek parametre
      sparkline: false,
    },
  });
  return response.data;
};

export const getCoinDetail = async (id: string): Promise<CoinDetail> => {
  const response = await api.get(`/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: false,
    },
  });
  return response.data;
};

export const getCoinsByIds = async (coinIds: string[]): Promise<Coin[]> => {
  if (coinIds.length === 0) return [];
  const response = await api.get('/coins/markets', {
    params: {
      vs_currency: 'usd',
      ids: coinIds.join(','),
      order: 'market_cap_desc',
      sparkline: false,
    },
  });
  return response.data;
};