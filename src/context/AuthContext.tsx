import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

// Context'in taşıyacağı verilerin tipi
interface AuthContextType {
  user: User | null;      // Kullanıcı nesnesi veya null
  loading: boolean;       // Giriş durumu kontrol ediliyor mu?
  isAuthenticated: boolean; // Giriş yapılmış mı?
}

// Boş bir context oluştur
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Provider bileşeni (App.tsx'i bununla sarmalayacağız)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase'in "Dinleyicisi". Kullanıcı giriş/çıkış yaparsa anında tetiklenir.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Kontrol bitti, loading'i kapat
    });

    // Component kapanırsa dinlemeyi bırak (Memory Leak önlemi)
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated: !!user // user varsa true, yoksa false döner
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook: Diğer sayfalardan kolayca erişmek için
export const useAuth = () => useContext(AuthContext);