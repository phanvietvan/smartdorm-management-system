import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Phone, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName, email, phone, password });
      navigation.replace('Main');
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      Alert.alert('Đăng ký thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon: Icon, placeholder, value, onChangeText, keyboardType, secureTextEntry, autoCapitalize }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0', height: 56, marginBottom: 16 }}>
      <Icon size={18} color="#94a3b8" />
      <TextInput
        style={{ flex: 1, marginLeft: 12, fontWeight: '600', color: '#0f172a', fontSize: 15 }}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry || false}
        autoCapitalize={autoCapitalize || 'sentences'}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32, paddingTop: 24 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: '#f1f5f9', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>

          <Text style={{ fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1, marginBottom: 8 }}>Tạo tài khoản</Text>
          <Text style={{ color: '#64748b', fontSize: 16, marginBottom: 36 }}>Bắt đầu cuộc sống tiện nghi tại SmartDorm ngay hôm nay.</Text>

          <InputField icon={User} placeholder="Họ và tên" value={fullName} onChangeText={setFullName} />
          <InputField icon={Mail} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputField icon={Phone} placeholder="Số điện thoại (tùy chọn)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <InputField icon={Lock} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
          <InputField icon={Lock} placeholder="Xác nhận mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" />

          <TouchableOpacity
            style={{ backgroundColor: '#2563eb', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1, marginTop: 16, shadowColor: '#2563eb', shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 16, textTransform: 'uppercase' }}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, marginBottom: 32 }}>
            <Text style={{ color: '#64748b', fontWeight: '600' }}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: '#2563eb', fontWeight: '900' }}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
