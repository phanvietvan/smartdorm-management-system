import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Users, Activity } from 'lucide-react-native';

const HERO_BG = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=2000";

export default function LandingPage({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }} bounces={false}>
      <ImageBackground 
        source={{ uri: HERO_BG }}
        style={{ height: 600, width: '100%', justifyContent: 'center', paddingHorizontal: 24 }}
      >
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        
        <SafeAreaView style={{ zIndex: 10, alignItems: 'center' }}>
          <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 24 }}>
            <Text style={{ fontSize: 10, color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 }}>Hệ sinh thái SmartDorm</Text>
          </View>

          <Text style={{ fontSize: 40, fontWeight: '900', textAlign: 'center', color: 'white', lineHeight: 48, marginBottom: 16 }}>
            Cách mạng Quản lý{"\n"}
            <Text style={{ color: '#c7d2fe' }}>SmartDorm.</Text>
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontWeight: '700', paddingHorizontal: 16, marginBottom: 40, fontStyle: 'italic' }}>
            Kiến tạo không gian sống thông minh, tối ưu vận hành & nâng tầm trải nghiệm.
          </Text>

          <View style={{ width: '100%' }}>
            <TouchableOpacity 
              style={{ backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 30, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, marginBottom: 16 }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Bắt đầu ngay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 16, borderRadius: 30, alignItems: 'center' }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Slender Pill Stats Card */}
        <View style={{ position: 'absolute', bottom: -35, left: 24, right: 24 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 40, paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Zap size={16} color="#2563eb" strokeWidth={3} />
              <Text style={{ fontSize: 8, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', marginTop: 4 }}>Hiệu suất</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>+45%</Text>
            </View>
            <View style={{ width: 1, height: '100%', backgroundColor: '#e2e8f0' }} />
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Users size={16} color="#8b5cf6" strokeWidth={3} />
              <Text style={{ fontSize: 8, fontWeight: '900', color: '#8b5cf6', textTransform: 'uppercase', marginTop: 4 }}>Cư dân</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>2k+</Text>
            </View>
            <View style={{ width: 1, height: '100%', backgroundColor: '#e2e8f0' }} />
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Activity size={16} color="#f59e0b" strokeWidth={3} />
              <Text style={{ fontSize: 8, fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase', marginTop: 4 }}>Vận hành</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>24/7</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={{ height: 80 }} /> 

      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 16 }}>Sẵn sàng trải nghiệm?</Text>
        <Text style={{ color: '#64748b', textAlign: 'center', fontWeight: '700', fontStyle: 'italic' }}>
          Hệ thống quản trị và tự động hóa vận hành bất động sản cho thuê số 1 Việt Nam.
        </Text>
      </View>
    </ScrollView>
  );
}
