import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Receipt, Download, ChevronRight } from 'lucide-react-native';

const BillsScreen = () => {
  const bills = [
    { id: '1', month: 'Tháng 4, 2024', amount: '1,250,000 VND', status: 'Chưa thanh toán', type: 'Phòng + DV' },
    { id: '2', month: 'Tháng 3, 2024', amount: '1,420,000 VND', status: 'Đã thanh toán', type: 'Phòng + DV' },
    { id: '3', month: 'Tháng 2, 2024', amount: '1,380,000 VND', status: 'Đã thanh toán', type: 'Phòng + DV' },
  ];

  const renderBillItem = ({ item }) => (
    <TouchableOpacity className="bg-white p-5 rounded-3xl mb-4 flex-row items-center justify-between shadow-sm border border-gray-100">
      <View className="flex-row items-center">
        <View className={`p-3 rounded-2xl mr-4 ${item.status === 'Chưa thanh toán' ? 'bg-orange-100' : 'bg-emerald-100'}`}>
          <Receipt size={24} color={item.status === 'Chưa thanh toán' ? '#f97316' : '#059669'} />
        </View>
        <View>
          <Text className="text-gray-900 font-bold text-lg">{item.month}</Text>
          <Text className="text-gray-500">{item.amount}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className={`text-xs font-bold mb-1 ${item.status === 'Chưa thanh toán' ? 'text-orange-600' : 'text-emerald-600'}`}>
          {item.status}
        </Text>
        <ChevronRight size={18} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-12 px-6">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900">Hóa đơn</Text>
        <Text className="text-gray-500">Quản lý các khoản thanh toán của bạn</Text>
      </View>

      <FlatList
        data={bills}
        renderItem={renderBillItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default BillsScreen;
