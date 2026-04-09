import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { User, Mail, Lock, Phone, ChevronLeft } from 'lucide-react-native';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-8 pt-12">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="bg-gray-50 w-12 h-12 rounded-full items-center justify-center mb-8"
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>

        <Text className="text-4xl font-bold text-gray-900 mb-2">Tạo tài khoản</Text>
        <Text className="text-gray-500 text-lg mb-10">Bắt đầu cuộc sống tiện nghi tại SmartDorm ngay hôm nay.</Text>

        <View className="space-y-6">
          <View className="border-b border-gray-100 py-3 flex-row items-center mb-4">
            <User size={20} color="#9ca3af" className="mr-3" />
            <TextInput 
              placeholder="Họ và tên"
              className="flex-1 text-lg ml-3"
              placeholderTextColor="#9ca3af"
              value={formData.fullName}
              onChangeText={(text) => setFormData({...formData, fullName: text})}
            />
          </View>

          <View className="border-b border-gray-100 py-3 flex-row items-center mb-4">
            <Mail size={20} color="#9ca3af" className="mr-3" />
            <TextInput 
              placeholder="Email"
              keyboardType="email-address"
              className="flex-1 text-lg ml-3"
              placeholderTextColor="#9ca3af"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
            />
          </View>

          <View className="border-b border-gray-100 py-3 flex-row items-center mb-4">
            <Phone size={20} color="#9ca3af" className="mr-3" />
            <TextInput 
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
              className="flex-1 text-lg ml-3"
              placeholderTextColor="#9ca3af"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />
          </View>

          <View className="border-b border-gray-100 py-3 flex-row items-center mb-4">
            <Lock size={20} color="#9ca3af" className="mr-3" />
            <TextInput 
              placeholder="Mật khẩu"
              secureTextEntry
              className="flex-1 text-lg ml-3"
              placeholderTextColor="#9ca3af"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
            />
          </View>

          <View className="border-b border-gray-200 py-3 flex-row items-center mb-10">
            <Lock size={20} color="#9ca3af" className="mr-3" />
            <TextInput 
              placeholder="Xác nhận mật khẩu"
              secureTextEntry
              className="flex-1 text-lg ml-3"
              placeholderTextColor="#9ca3af"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            />
          </View>

          <TouchableOpacity 
            className="bg-blue-600 py-5 rounded-3xl shadow-lg shadow-blue-200 items-center justify-center mb-6"
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text className="text-white font-bold text-xl">Đăng ký</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center pb-12">
          <Text className="text-gray-500 text-lg">Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-blue-600 font-bold text-lg">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
