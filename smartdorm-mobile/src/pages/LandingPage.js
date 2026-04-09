import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Users, Activity, Cpu } from 'lucide-react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const { width } = Dimensions.get('window');

const HERO_BG = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=2000";

export default function LandingPage({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <ImageBackground 
        source={{ uri: HERO_BG }}
        className="h-[600px] w-full justify-center px-6"
      >
        <View className="absolute inset-0 bg-black/40" />
        
        <SafeAreaView className="z-10 items-center">
          <View className="bg-indigo-400/30 px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <Text className="text-[10px] items-center text-white font-black uppercase tracking-[0.2em]">Hệ sinh thái SmartDorm</Text>
          </View>

          <Text className="text-4xl md:text-5xl font-black text-center text-white leading-tight mb-4">
            Cách mạng Quản lý{"\n"}
            <Text className="text-primary-container">SmartDorm.</Text>
          </Text>

          <Text className="text-white/80 text-center font-bold px-4 mb-10 italic">
            Kiến tạo không gian sống thông minh, tối ưu vận hành & nâng tầm trải nghiệm.
          </Text>

          <View className="w-full gap-4">
            <TouchableOpacity 
              className="bg-primary py-4 rounded-full items-center shadow-lg shadow-primary/30"
              onPress={() => navigation.navigate('Rooms')}
            >
              <Text className="text-white font-black text-lg">Tìm phòng ngay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-slate-900/40 border border-white/10 py-4 rounded-full items-center">
              <Text className="text-white font-black text-lg">Hợp tác cho chủ nhà</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Slender Pill Stats Card - Mirrored from Web */}
        <View className="absolute bottom-[-35px] left-6 right-6">
          <View className="bg-white/90 rounded-full py-4 px-6 flex-row justify-between shadow-xl border border-white">
            <View className="items-center flex-1">
              <Zap size={16} color="#5c59f0" strokeWidth={3} />
              <Text className="text-[8px] font-black text-primary uppercase mt-1">Hiệu suất</Text>
              <Text className="text-lg font-black text-on-surface">+45%</Text>
            </View>
            <View className="w-[1px] h-full bg-slate-200" />
            <View className="items-center flex-1">
              <Users size={16} color="#8b5cf6" strokeWidth={3} />
              <Text className="text-[8px] font-black text-secondary uppercase mt-1">Cư dân</Text>
              <Text className="text-lg font-black text-on-surface">2k+</Text>
            </View>
            <View className="w-[1px] h-full bg-slate-200" />
            <View className="items-center flex-1">
              <Activity size={16} color="#f59e0b" strokeWidth={3} />
              <Text className="text-[8px] font-black text-tertiary uppercase mt-1">Vận hành</Text>
              <Text className="text-lg font-black text-on-surface">24/7</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View className="h-20" /> {/* Spacer for stats card overlap */}

      {/* Additional sections can follow here */}
      <View className="p-10 items-center">
        <Text className="text-2xl font-black text-on-surface mb-4">Sẵn sàng trải nghiệm?</Text>
        <Text className="text-slate-500 text-center font-bold italic mb-10">
          Hệ thống quản trị và tự động hóa vận hành bất động sản cho thuê số 1 Việt Nam.
        </Text>
      </View>
    </ScrollView>
  );
}
