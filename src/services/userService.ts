import { db } from '../config/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Coin, CoinDetail } from '../types/coin';

// Favori Ekleme (Coin verisini de kaydediyoruz ki tekrar API isteği atmayalım)
export const addFavorite = async (userId: string, coin: Coin | CoinDetail) => {
  try {
    // users -> userId -> favorites -> coinId
    const ref = doc(db, 'users', userId, 'favorites', coin.id);
    await setDoc(ref, {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: typeof coin.image === 'string' ? coin.image : coin.image.large, // Detay ve Liste objesi farkını yönet
      current_price: typeof coin.current_price === 'number' ? coin.current_price : coin.market_data.current_price.usd // Detay/Liste farkı
    });
    console.log('Favori eklendi');
  } catch (error) {
    console.error('Favori eklenirken hata:', error);
    throw error;
  }
};

// Favori Çıkarma
export const removeFavorite = async (userId: string, coinId: string) => {
  try {
    const ref = doc(db, 'users', userId, 'favorites', coinId);
    await deleteDoc(ref);
    console.log('Favori silindi');
  } catch (error) {
    console.error('Favori silinirken hata:', error);
    throw error;
  }
};

// Realtime Favori Dinleme (Hook içinde kullanacağız)
export const subscribeToFavorites = (userId: string, onUpdate: (coins: any[]) => void) => {
  const ref = collection(db, 'users', userId, 'favorites');
  
  // onSnapshot: Veritabanında bir şey değiştiği an (ekleme/silme) bu fonksiyon çalışır.
  // Bu sayede favori ekleyince sayfayı yenilemeye gerek kalmaz.
  const unsubscribe = onSnapshot(ref, (snapshot) => {
    const favorites = snapshot.docs.map(doc => doc.data());
    onUpdate(favorites);
  });

  return unsubscribe; // Dinlemeyi durdurmak için bunu döndürüyoruz
};