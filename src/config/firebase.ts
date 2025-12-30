import { initializeApp } from 'firebase/app';
// Auth (Giriş) ve Firestore (Veritabanı) servislerini import ediyoruz
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// .env'den okuyoruz
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID,
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Auth Modülünü Başlat (React Native için özel ayar)
// Bu ayar sayesinde kullanıcı uygulamayı kapatıp açsa bile çıkış yapmaz (Persistence)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage as any)
});

const db = getFirestore(app);

export { auth, db };