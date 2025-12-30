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