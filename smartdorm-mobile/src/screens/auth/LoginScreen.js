import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

// Quan trọng: cần gọi cái này để WebBrowser hoạt động đúng trên mobile
WebBrowser.maybeCompleteAuthSession();

// Google Client IDs - Sử dụng chung Web Client ID để test local đồng bộ
const GOOGLE_CLIENT_ID_ANDROID = '1742339132-c1ct4i9hosca704jg01lqn25u7isjsjt.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_IOS     = '1742339132-c1ct4i9hosca704jg01lqn25u7isjsjt.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_WEB     = '1742339132-c1ct4i9hosca704jg01lqn25u7isjsjt.apps.googleusercontent.com';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    webClientId: GOOGLE_CLIENT_ID_WEB,
    scopes: ['profile', 'email'],
    // Đảm bảo redirectUri được xác định rõ ràng cho môi trường Web
    redirectUri: makeRedirectUri({
      preferLocalhost: true,
    }),
  });

  useEffect(() => {
    console.log('--- Google Auth Response ---');
    console.log('Type:', response?.type);
    if (response?.type === 'success') {
      console.log('Auth success, handling response...');
      handleGoogleResponse(response);
    } else if (response?.type === 'error') {
      console.error('Auth error:', response.error);
      Alert.alert('Lỗi Google', response.error?.message || 'Đăng nhập Google thất bại');
    } else if (response?.type === 'cancel') {
      console.log('Auth cancelled by user');
    }
  }, [response]);

  const handleGoogleResponse = async (res) => {
    setGoogleLoading(true);
    try {
      const { authentication } = res;
      if (!authentication?.accessToken) {
        throw new Error('Không nhận được access token từ Google');
      }

      // Lấy thông tin user từ Google bằng access token
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });
      const userInfo = await userInfoRes.json();

      // Gửi id_token hoặc dùng access token để xác thực với backend
      // Backend nhận credential = ID Token. Với Expo, ta dùng idToken nếu có, hoặc fallback
      const credential = authentication.idToken || authentication.accessToken;

      const backendRes = await client.post('/auth/google', { credential });
      const { token, user } = backendRes.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Quan trọng: Phải chuyển sang Main
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Google login error:', error);
      const msg = error.response?.data?.message || error.message || 'Đăng nhập Google thất bại';
      Alert.alert('Lỗi đăng nhập Google', msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Main');
    } catch (error) {
      const msg = error.response?.data?.message || 'Thông tin đăng nhập không chính xác';
      Alert.alert('Đăng nhập thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32, paddingTop: 48 }}>
          {/* Brand */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{ backgroundColor: '#2563eb', width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>SD</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#0f172a', marginTop: 16, letterSpacing: -0.5 }}>SMARTDORM</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '700', letterSpacing: 4 }}>MANAGEMENT SYSTEM</Text>
          </View>

          <Text style={{ fontSize: 28, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5, marginBottom: 4 }}>Chào mừng bạn!</Text>
          <Text style={{ color: '#64748b', fontWeight: '500', marginBottom: 32 }}>Nhập thông tin đăng nhập để tiếp tục.</Text>

          {/* Email */}
          <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>Email của bạn</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0', height: 56, marginBottom: 20 }}>
            <Mail size={18} color="#94a3b8" />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontWeight: '600', color: '#0f172a', fontSize: 15 }}
              placeholder="name@example.com"
              placeholderTextColor="#cbd5e1"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
            <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Mật khẩu</Text>
            <TouchableOpacity><Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 12 }}>Quên mật khẩu?</Text></TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0', height: 56, marginBottom: 32 }}>
            <Lock size={18} color="#94a3b8" />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontWeight: '600', color: '#0f172a', fontSize: 15 }}
              placeholder="••••••••"
              placeholderTextColor="#cbd5e1"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={{ backgroundColor: '#2563eb', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1, shadowColor: '#2563eb', shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 16, marginRight: 8, textTransform: 'uppercase' }}>Đăng nhập</Text>
                <ArrowRight size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 28 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
            <Text style={{ marginHorizontal: 16, color: '#94a3b8', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>Hoặc tiếp tục với</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'white', height: 56, borderRadius: 16,
              borderWidth: 1.5, borderColor: '#e2e8f0',
              shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
              opacity: (!request || googleLoading) ? 0.7 : 1,
            }}
            onPress={() => promptAsync()}
            disabled={!request || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#4285f4" />
            ) : (
              <>
                {/* Google G Logo bằng text màu */}
                <View style={{ width: 24, height: 24, marginRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#4285f4' }}>G</Text>
                </View>
                <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 15 }}>Đăng nhập với Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28, marginBottom: 32 }}>
            <Text style={{ color: '#64748b', fontWeight: '600' }}>Bạn mới đến đây? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: '#2563eb', fontWeight: '900', textTransform: 'uppercase' }}>Tạo tài khoản ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
