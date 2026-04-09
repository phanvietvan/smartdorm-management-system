import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { roomsApi } from '../api/rooms';
import { Search, MapPin, Star } from 'lucide-react-native';

const ROOM_DEMO_IMG = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1000";

export default function RoomsAvailable({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await roomsApi.getAll();
      setRooms(data);
    } catch (error) {
      console.log("Error fetching rooms:", error);
      // Fallback for demo
      setRooms([{ id: 1, name: "Premium Smart Studio", price: 5500000, area: "Quận 1", rating: 4.8 }]);
    } finally {
      setLoading(false);
    }
  };

  const renderRoom = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-3xl mb-6 overflow-hidden shadow-xl shadow-slate-200"
      activeOpacity={0.9}
      onPress={() => navigation.navigate('RoomDetail', { item })}
    >
      <Image source={{ uri: ROOM_DEMO_IMG }} className="h-48 w-full" />
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-black text-on-surface tracking-tight">{item.name}</Text>
          <View className="flex-row items-center bg-tertiary/10 px-2 py-1 rounded-lg">
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <Text className="text-[10px] font-black text-tertiary ml-1">{item.rating || '4.9'}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-4">
          <MapPin size={14} color="#94a3b8" />
          <Text className="text-slate-500 font-bold ml-1 text-xs uppercase tracking-tighter">{item.area || 'Hồ Chí Minh'}</Text>
        </View>

        <View className="flex-row justify-between items-center pt-4 border-t border-slate-100">
          <View>
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Giá hàng tháng</Text>
            <Text className="text-lg font-black text-primary">{(item.price || 0).toLocaleString()} VNĐ</Text>
          </View>
          <TouchableOpacity className="bg-primary/90 px-6 py-2.5 rounded-full shadow-lg shadow-primary/20">
            <Text className="text-white font-black text-xs uppercase">Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-4 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-black text-on-surface tracking-tighter">Phòng Trống</Text>
          <Text className="text-slate-500 font-bold italic text-xs">Tìm tổ ấm thông minh của bạn</Text>
        </View>
        <TouchableOpacity 
          className="w-12 h-12 bg-white rounded-2xl shadow-sm items-center justify-center border border-slate-100"
          onPress={() => navigation.goBack()}
        >
          <Search size={20} color="#5c59f0" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#5c59f0" />
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
