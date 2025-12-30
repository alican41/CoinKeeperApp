import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Giriş modunda mı Kayıt modunda mı?

  // Firebase İşlemleri
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Giriş Yap
        await signInWithEmailAndPassword(auth, email, password);
        // Başarılı olursa navigation yapmaya gerek yok, Context otomatik algılayıp sayfayı değiştirecek!
      } else {
        // Kayıt Ol
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Başarılı', 'Hesap oluşturuldu, hoşgeldiniz!');
      }
    } catch (error: any) {
      // Hata mesajlarını Türkçeleştirmek mülakatta artı puandır
      let msg = error.message;
      if (msg.includes('invalid-email')) msg = 'Geçersiz email formatı.';
      if (msg.includes('user-not-found')) msg = 'Kullanıcı bulunamadı.';
      if (msg.includes('wrong-password')) msg = 'Hatalı şifre.';
      if (msg.includes('email-already-in-use')) msg = 'Bu email zaten kullanımda.';
      
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}</Text>
          )}
        </TouchableOpacity>

        {/* Mod Değiştirme (Login <-> Register) */}
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
          <Text style={styles.switchText}>
            {isLogin ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  formContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchButton: { marginTop: 15, alignItems: 'center' },
  switchText: { color: '#2196F3', fontSize: 14 }
});

export default LoginScreen;