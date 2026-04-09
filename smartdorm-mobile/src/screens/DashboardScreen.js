import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Home, Receipt, Bell, ChevronRight } from 'lucide-react-native';

const DashboardScreen = ({ navigation }) => {
  return (
    <ScrollView className="flex-1 bg-gray-50 pt-12 px-6">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-gray-500 text-lg font-medium">Chào buổi sáng,</Text>
          <Text className="text-3xl font-black text-slate-900 tracking-tighter">Cư dân</Text>
        </View>
        <TouchableOpacity className="bg-white p-3 rounded-full shadow-sm border border-slate-100">
          <Bell size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View className="flex-row justify-between mb-8">
        <View className="bg-blue-600 p-4 rounded-3xl w-[48%] shadow-lg shadow-blue-100">
          <Text className="text-blue-100 mb-1 font-bold text-xs uppercase tracking-widest">Dịch vụ</Text>
          <Text className="text-white text-3xl font-black">04</Text>
        </View>
        <View className="bg-emerald-600 p-4 rounded-3xl w-[48%] shadow-lg shadow-emerald-100">
          <Text className="text-emerald-100 mb-1 font-bold text-xs uppercase tracking-widest">Yêu cầu</Text>
          <Text className="text-white text-3xl font-black">01</Text>
        </View>
      </View>

      {/* Outstanding Bill */}
      <TouchableOpacity 
        className="bg-white p-6 rounded-[2.5rem] mb-8 flex-row items-center justify-between shadow-sm border border-slate-100"
        onPress={() => navigation.navigate('Bills')}
      >
        <View className="flex-row items-center">
          <View className="bg-orange-100 p-3 rounded-2xl mr-4">
            <Receipt size={24} color="#f97316" />
          </View>
          <View>
            <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">Hóa đơn chưa thanh toán</Text>
            <Text className="text-xl font-black text-slate-900 mt-1">1,250,000 VND</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#94a3b8" />
      </TouchableOpacity>

      {/* Recent Activity */}
      <Text className="text-xl font-black text-slate-900 mb-4 tracking-tight">Hoạt động gần đây</Text>
      <View className="bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100 mb-20">
        <View className="p-4 flex-row items-center border-b border-slate-50">
          <View className="bg-slate-100 p-2 rounded-xl mr-4">
            <Bell size={18} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-slate-900">Thông báo tiền điện tháng 3</Text>
            <Text className="text-slate-400 text-xs font-medium">2 giờ trước</Text>
          </View>
        </View>
        <View className="p-4 flex-row items-center">
          <View className="bg-slate-100 p-2 rounded-xl mr-4">
            <Receipt size={18} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-slate-900">Yêu cầu bảo trì đã hoàn thành</Text>
            <Text className="text-slate-400 text-xs font-medium">Hôm qua</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;
