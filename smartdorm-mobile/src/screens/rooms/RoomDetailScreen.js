import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Maximize, Users, ShieldCheck, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const ROOM_IMG = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1000";

export default function RoomDetailScreen({ navigation, route }) {
  // item is passed via navigation
  const item = route.params?.item || { 
    name: "Premium Smart Studio", 
    price: 5500000, 
    area: "Quận 1, TP. HCM",
    description: "Căn hộ studio thông minh với đầy đủ nội thất cao cấp, hệ thống điều khiển ánh sáng và nhiệt độ qua điện thoại. Tầm nhìn panorama toàn thành phố."
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="relative">
          <Image source={{ uri: ROOM_IMG }} className="w-full h-[450px]" resizeMode="cover" />
          <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between px-6 pt-4">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30"
            >
              <ChevronLeft size={24} color="white" strokeWidth={3} />
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30">
              <Heart size={20} color="white" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View className="px-8 pt-8 pb-32 bg-white -mt-10 rounded-t-[40px] shadow-2xl">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-black text-on-surface tracking-tighter mb-2">{item.name}</Text>
              <View className="flex-row items-center">
                <MapPin size={14} color="#5c59f0" />
                <Text className="text-primary font-black ml-1 text-xs uppercase tracking-tighter">{item.area}</Text>
              </View>
            </View>
            <View className="bg-primary/10 px-4 py-2 rounded-2xl items-center justify-center">
              <Text className="text-primary font-black text-lg">4.9</Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row justify-between my-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <View className="items-center">
              <Maximize size={20} color="#64748b" />
              <Text className="text-on-surface font-black mt-2">25 m²</Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1">Diện tích</Text>
            </View>
            <View className="w-[1px] h-10 bg-slate-200 self-center" />
            <View className="items-center">
              <Users size={20} color="#64748b" />
              <Text className="text-on-surface font-black mt-2">02</Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1">Sức chứa</Text>
            </View>
            <View className="w-[1px] h-10 bg-slate-200 self-center" />
            <View className="items-center">
              <ShieldCheck size={20} color="#64748b" />
              <Text className="text-on-surface font-black mt-2">Bảo vệ</Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1">An ninh</Text>
            </View>
          </View>

          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Mô tả chi tiết</Text>
          <Text className="text-slate-600 font-bold leading-6 mb-8 italic">
            {item.description}
          </Text>

          {/* Amenities or more details could go here */}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-8 flex-row items-center justify-between pb-10">
        <View>
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Tổng cộng</Text>
          <Text className="text-2xl font-black text-on-surface">{(item.price || 0).toLocaleString()} <Text className="text-sm font-bold text-slate-400">/tháng</Text></Text>
        </View>
        <TouchableOpacity className="bg-primary px-10 py-5 rounded-full shadow-2xl shadow-primary/30">
          <Text className="text-white font-black text-lg uppercase tracking-tight">Thuê ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
