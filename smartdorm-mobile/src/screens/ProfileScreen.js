import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { User, Settings, LogOut, Shield, CreditCard, Bell, ChevronRight } from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
  const menuItems = [
    { icon: User, label: 'Thông tin cá nhân', color: 'bg-blue-100', iconColor: '#2563eb' },
    { icon: Bell, label: 'Thông báo', color: 'bg-emerald-100', iconColor: '#059669' },
    { icon: CreditCard, label: 'Phương thức thanh toán', color: 'bg-purple-100', iconColor: '#9333ea' },
    { icon: Shield, label: 'Bảo mật', color: 'bg-orange-100', iconColor: '#f97316' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 pt-12">
      <View className="px-6 items-center mb-10">
        <View className="relative">
          <View className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-sm overflow-hidden">
            <View className="flex-1 items-center justify-center bg-blue-600">
               <Text className="text-white text-4xl font-bold">JD</Text>
            </View>
          </View>
          <TouchableOpacity className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md">
            <Settings size={18} color="#4b5563" />
          </TouchableOpacity>
        </View>
        <Text className="mt-4 text-2xl font-bold text-gray-900">John Doe</Text>
        <Text className="text-gray-500">Phòng 402 - Tòa A</Text>
      </View>

      <View className="px-6 space-y-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            className="bg-white p-4 rounded-3xl flex-row items-center justify-between mb-4 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center">
              <View className={`${item.color} p-3 rounded-2xl mr-4`}>
                <item.icon size={22} color={item.iconColor} />
              </View>
              <Text className="text-gray-900 font-semibold text-lg">{item.label}</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          className="mt-8 bg-red-50 p-4 rounded-3xl flex-row items-center justify-center border border-red-100"
          onPress={() => navigation.navigate('Login')}
        >
          <LogOut size={20} color="#dc2626" className="mr-2" />
          <Text className="text-red-600 font-bold text-lg ml-2">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      <View className="h-20" />
    </ScrollView>
  );
};

export default ProfileScreen;
