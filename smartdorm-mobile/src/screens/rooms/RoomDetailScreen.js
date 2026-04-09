import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Maximize, Users, ShieldCheck, Wifi, Car, Tv } from 'lucide-react-native';
import { rentalRequestsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  available: { label: 'Còn phòng', color: '#059669', bg: '#ecfdf5' },
  occupied: { label: 'Đã đặt', color: '#dc2626', bg: '#fef2f2' },
  maintenance: { label: 'Bảo trì', color: '#f97316', bg: '#fff7ed' },
};

export default function RoomDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const room = route.params?.room || route.params?.item || {};
  const [requesting, setRequesting] = useState(false);

  const cfg = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;

  const handleRentRequest = async () => {
    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để gửi yêu cầu thuê phòng');
      navigation.navigate('Login');
      return;
    }
    Alert.alert('Xác nhận thuê phòng', `Gửi yêu cầu thuê phòng ${room.name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Gửi yêu cầu', onPress: async () => {
          setRequesting(true);
          try {
            await rentalRequestsApi.create({ roomId: room._id });
            Alert.alert('Thành công', 'Đã gửi yêu cầu thuê phòng. Chúng tôi sẽ liên hệ sớm!');
          } catch (e) {
            Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi yêu cầu');
          } finally {
            setRequesting(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Color Header */}
        <View style={{ backgroundColor: '#2563eb', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 }}>
          <SafeAreaView>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
            >
              <ChevronLeft size={22} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
          </SafeAreaView>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Thông tin phòng</Text>
          <Text style={{ color: 'white', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 }}>Phòng {room.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <MapPin size={14} color="rgba(255,255,255,0.7)" />
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>Tầng {room.floor || '—'}</Text>
          </View>
        </View>

        {/* Content card */}
        <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 }}>
          {/* Status + Price */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ color: cfg.color, fontWeight: '800', fontSize: 13 }}>{cfg.label}</Text>
            </View>
            {room.price && (
              <Text style={{ color: '#2563eb', fontWeight: '900', fontSize: 20 }}>
                {room.price.toLocaleString('vi-VN')} ₫
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>/tháng</Text>
              </Text>
            )}
          </View>

          {/* Quick stats */}
          <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 18, padding: 16, marginBottom: 20, justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Maximize size={20} color="#2563eb" />
              <Text style={{ fontWeight: '900', color: '#0f172a', marginTop: 6 }}>{room.area || '—'} m²</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>Diện tích</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#e2e8f0' }} />
            <View style={{ alignItems: 'center' }}>
              <Users size={20} color="#2563eb" />
              <Text style={{ fontWeight: '900', color: '#0f172a', marginTop: 6 }}>{room.capacity || '—'}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>Sức chứa</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#e2e8f0' }} />
            <View style={{ alignItems: 'center' }}>
              <ShieldCheck size={20} color="#2563eb" />
              <Text style={{ fontWeight: '900', color: '#0f172a', marginTop: 6 }}>24/7</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>An ninh</Text>
            </View>
          </View>

          {/* Description */}
          {room.description && (
            <>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Mô tả</Text>
              <Text style={{ color: '#64748b', lineHeight: 22, fontSize: 14, marginBottom: 20 }}>{room.description}</Text>
            </>
          )}

          {/* Amenities */}
          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Tiện nghi</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { icon: Wifi, label: 'Wifi tốc độ cao' },
              { icon: Car, label: 'Bãi đỗ xe' },
              { icon: ShieldCheck, label: 'Camera 24/7' },
              { icon: Tv, label: 'Truyền hình' },
            ].map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                <item.icon size={14} color="#2563eb" />
                <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 12, marginLeft: 6 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={{ backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
        <TouchableOpacity
          style={{ backgroundColor: room.status === 'available' ? '#2563eb' : '#94a3b8', padding: 18, borderRadius: 18, alignItems: 'center', opacity: requesting ? 0.7 : 1, shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }}
          onPress={room.status === 'available' ? handleRentRequest : undefined}
          disabled={room.status !== 'available' || requesting}
        >
          {requesting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {room.status === 'available' ? 'Gửi yêu cầu thuê phòng' : 'Phòng không khả dụng'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
