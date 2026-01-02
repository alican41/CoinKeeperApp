import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getMarketCoins, getCoinDetail, getCoinMarketChart } from '../services/coinService';

// 1. Ana Sayfa İçin Sonsuz Kaydırma Hook'u
export const useMarketCoins = () => {
  return useInfiniteQuery({
    queryKey: ['marketCoins'], // Cache anahtarı
    queryFn: getMarketCoins,   // Çalışacak fonksiyon
    initialPageParam: 1,       // Başlangıç sayfası
    getNextPageParam: (lastPage, allPages) => {
      // Eğer gelen veri 20'den azsa son sayfadayız demektir
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
  });
};

// 2. Detay Sayfası İçin Hook
export const useCoinDetail = (coinId: string) => {
  return useQuery({
    queryKey: ['coinDetail', coinId], // coinId değiştikçe yeni istek atar
    queryFn: () => getCoinDetail(coinId),
    enabled: !!coinId, // ID yoksa çalışma
  });
};

export const useCoinMarketChart = (coinId: string) => {
  return useQuery({
    queryKey: ['coinMarketChart', coinId],
    queryFn: () => getCoinMarketChart(coinId),
    enabled: !!coinId,
    staleTime: 1000 * 60 * 5, // Grafik verisi 5 dakika bayatlamasın
  });
};