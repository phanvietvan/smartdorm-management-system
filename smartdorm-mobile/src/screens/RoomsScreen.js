import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, Search, MapPin, Bed } from 'lucide-react-native';
import { roomsApi } from '../api';

const STATUS_CONFIG = {
  available: { label: 'Còn phòng', color: '#059669', bg: '#ecfdf5' },
  occupied: { label: 'Đã đặt', color: '#dc2626', bg: '#fef2f2' },
  maintenance: { label: 'Bảo trì', color: '#f97316', bg: '#fff7ed' },
};

export default function RoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await roomsApi.getAll();
      setRooms(res.data || []);
    } catch (e) {
      console.error('Rooms fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const filtered = rooms.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.floor?.toString().includes(search)
  );

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
    return (
      <TouchableOpacity
        style={{ backgroundColor: 'white', borderRadius: 20, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}
        onPress={() => navigation.navigate('RoomDetail', { room: item })}
      >
        <View style={{ height: 8, backgroundColor: item.status === 'available' ? '#059669' : item.status === 'occupied' ? '#dc2626' : '#f97316' }} />
        <View style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '900', color: '#0f172a', fontSize: 17 }}>Phòng {item.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <MapPin size={12} color="#94a3b8" />
                <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>Tầng {item.floor}</Text>
                {item.capacity && (
                  <>
                    <Bed size={12} color="#94a3b8" style={{ marginLeft: 12 }} />
                    <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>{item.capacity} người</Text>
                  </>
                )}
              </View>
            </View>
            <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
              <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
            </View>
          </View>
          {item.price && (
            <Text style={{ color: '#2563eb', fontWeight: '900', fontSize: 16, marginTop: 12 }}>
              {item.price.toLocaleString('vi-VN')} ₫/tháng
            </Text>
          )}
          {item.description && (
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }} numberOfLines={1}>{item.description}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 }}>Danh sách phòng</Text>
        <Text style={{ color: '#64748b', fontWeight: '600', marginTop: 4, marginBottom: 16 }}>Tất cả phòng trong hệ thống</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={{ flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#0f172a' }}
            placeholder="Tìm theo tên phòng, tầng..."
            placeholderTextColor="#cbd5e1"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Building2 size={48} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontWeight: '700', marginTop: 16, fontSize: 15 }}>Không tìm thấy phòng nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
