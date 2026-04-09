import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../api/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      // Lưu token vào bộ nhớ máy
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        // Có thể lưu thêm thông tin user nếu cần
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        Alert.alert("Thành công", `Chào mừng ${response.data.user?.name || ''} quay lại!`);
        navigation.navigate('Main');
      } else {
        throw new Error("Không nhận được token từ hệ thống");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Thông tin đăng nhập không chính xác hoặc lỗi hệ thống";
      Alert.alert("Lỗi đăng nhập", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-12">
          {/* Logo/Brand Area */}
          <View className="items-center mb-10">
            <View className="bg-blue-600 w-16 h-16 rounded-3xl items-center justify-center shadow-lg shadow-blue-200">
              <Text className="text-white text-3xl font-black">SD</Text>
            </View>
            <Text className="text-2xl font-black text-slate-900 mt-4 tracking-tighter uppercase">SMARTDORM</Text>
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Management System</Text>
          </View>

          <View className="mb-8">
            <Text className="text-3xl font-black text-slate-900 tracking-tighter">Chào mừng bạn!</Text>
            <Text className="text-slate-500 font-medium mt-1">Nhập thông tin đăng nhập để tiếp tục.</Text>
          </View>

          <View className="space-y-6">
            <View>
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Email của bạn</Text>
              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 h-14">
                <Mail size={18} color="#94a3b8" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-slate-900"
                  placeholder="name@example.com"
                  placeholderTextColor="#cbd5e1"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-2 px-1">
                 <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Mật khẩu</Text>
                 <TouchableOpacity>
                    <Text className="text-blue-600 font-bold text-xs">Quên mật khẩu?</Text>
                 </TouchableOpacity>
              </View>
              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 h-14">
                <Lock size={18} color="#94a3b8" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-slate-900"
                  placeholder="••••••••"
                  placeholderTextColor="#cbd5e1"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity 
              className={`bg-blue-600 h-14 rounded-2xl flex-row items-center justify-center shadow-xl shadow-blue-100 mt-6 ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white font-black text-lg mr-2 uppercase">Đăng nhập</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center my-10">
            <View className="flex-1 h-[1px] bg-slate-100" />
            <Text className="mx-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Hoặc tiếp tục với</Text>
            <View className="flex-1 h-[1px] bg-slate-100" />
          </View>

          {/* Social login Button */}
          <TouchableOpacity 
            className="flex-row items-center justify-center bg-white border-2 border-slate-100 h-14 rounded-2xl shadow-sm"
          >
            <Image 
              source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }} 
              className="w-5 h-5 mr-3"
            />
            <Text className="text-slate-900 font-bold text-lg">Google Account</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-10 mb-8">
            <Text className="text-slate-500 font-bold">Bạn mới đến đây?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-blue-600 font-black ml-1 uppercase">Tạo tài khoản ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
