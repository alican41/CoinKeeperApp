// API'den gelecek verinin şablonunu çıkarıyoruz.
// CoinGecko API bize bu alanları dönecek.

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: {
    en: string; // Açıklama genelde HTML gelir
  };
  image: {
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    market_cap: {
      usd: number;
    };
    high_24h: {
      usd: number;
    };
    low_24h: {
      usd: number;
    };
  };
}