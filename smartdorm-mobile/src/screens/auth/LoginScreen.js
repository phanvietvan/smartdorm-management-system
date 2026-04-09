import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Logic call API auth here later
      // const response = await authApi.login({ email, password });
      // await AsyncStorage.setItem('token', response.data.token);
      
      Alert.alert("Thành công", "Chào mừng bạn quay lại SmartDorm!");
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert("Lỗi", "Thông tin đăng nhập không chính xác");
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
          <View className="mb-12">
            <Text className="text-4xl font-black text-on-surface tracking-tighter">Chào mừng!</Text>
            <Text className="text-slate-500 font-bold italic mt-2">Đăng nhập để quản lý tổ ấm của bạn</Text>
          </View>

          <View className="gap-6">
            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Địa chỉ Email</Text>
              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 h-14">
                <Mail size={18} color="#94a3b8" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-on-surface"
                  placeholder="name@example.com"
                  placeholderTextColor="#cbd5e1"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Mật khẩu</Text>
              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 h-14">
                <Lock size={18} color="#94a3b8" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-on-surface"
                  placeholder="••••••••"
                  placeholderTextColor="#cbd5e1"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <TouchableOpacity className="self-end mt-3">
                <Text className="text-primary font-black text-xs uppercase">Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className={`bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30 mt-4 ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white font-black text-lg mr-2 uppercase tracking-tight">Đăng nhập</Text>
              <ArrowRight size={20} color="white" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center my-10">
            <View className="flex-1 h-[1px] bg-slate-100" />
            <Text className="mx-4 text-slate-400 font-black text-[10px] uppercase">Hoặc tiếp tục với</Text>
            <View className="flex-1 h-[1px] bg-slate-100" />
          </View>

          <TouchableOpacity className="flex-row items-center justify-center bg-slate-900 h-14 rounded-2xl">
            <Github size={20} color="white" />
            <Text className="text-white font-black ml-3">Github</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-12 mb-8">
            <Text className="text-slate-500 font-bold">Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-primary font-black ml-2 uppercase">Tham gia ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
