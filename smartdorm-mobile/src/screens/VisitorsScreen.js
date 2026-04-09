import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserCheck, Plus, Check, X, Car } from 'lucide-react-native';
import { visitorsApi } from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  waiting: { label: 'Chờ duyệt', color: '#f97316', bg: '#fff7ed' },
  allowed: { label: 'Đã cho phép', color: '#059669', bg: '#ecfdf5' },
  denied: { label: 'Từ chối', color: '#dc2626', bg: '#fef2f2' },
  checked_out: { label: 'Đã về', color: '#64748b', bg: '#f8fafc' },
};

export default function VisitorsScreen() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', plateNumber: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await visitorsApi.getAll();
      setVisitors(res.data || []);
    } catch (e) {
      console.error('Visitors fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleCreate = async () => {
    if (!form.name || !user?.roomId) {
      Alert.alert('Lỗi', 'Cần nhập tên khách và bạn phải có phòng');
      return;
    }
    setSubmitting(true);
    try {
      const roomId = typeof user.roomId === 'object' ? user.roomId._id : user.roomId;
      await visitorsApi.create({ ...form, roomId, tenantId: user._id });
      setModalVisible(false);
      setForm({ name: '', phone: '', purpose: '', plateNumber: '' });
      fetchData();
      Alert.alert('Thành công', 'Đã đăng ký khách thành công');
    } catch (e) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể đăng ký khách');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (id, status) => {
    try {
      await visitorsApi.respond(id, status);
      fetchData();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể phản hồi');
    }
  };

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.waiting;
    return (
      <View style={{ backgroundColor: 'white', padding: 18, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 15 }}>{item.name}</Text>
            {item.phone ? <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>📱 {item.phone}</Text> : null}
            {item.purpose ? <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>🎯 {item.purpose}</Text> : null}
            {item.plateNumber ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Car size={12} color="#64748b" />
                <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 4 }}>{item.plateNumber}</Text>
              </View>
            ) : null}
            <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 6 }}>
              {new Date(item.checkInAt).toLocaleString('vi-VN')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
              <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
            </View>
            {item.status === 'waiting' && item.tenantId?._id === user?._id && (
              <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#ecfdf5', padding: 8, borderRadius: 12 }}
                  onPress={() => handleRespond(item._id, 'allowed')}
                >
                  <Check size={16} color="#059669" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#fef2f2', padding: 8, borderRadius: 12 }}
                  onPress={() => handleRespond(item._id, 'denied')}
                >
                  <X size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 }}>Khách thăm</Text>
          <Text style={{ color: '#64748b', fontWeight: '600', marginTop: 4 }}>Quản lý khách ra vào</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: '800', marginLeft: 6, fontSize: 13 }}>Đăng ký</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={visitors}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <UserCheck size={48} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontWeight: '700', marginTop: 16, fontSize: 15 }}>Chưa có khách nào</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16 }}>Đăng ký khách</Text>
            {[
              { label: 'Tên khách *', key: 'name', placeholder: 'Nguyễn Văn A' },
              { label: 'Số điện thoại', key: 'phone', placeholder: '0901234567' },
              { label: 'Mục đích thăm', key: 'purpose', placeholder: 'Thăm bạn bè...' },
              { label: 'Biển số xe', key: 'plateNumber', placeholder: '51A-12345' },
            ].map(field => (
              <View key={field.key}>
                <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{field.label}</Text>
                <TextInput
                  style={{ backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, fontSize: 14, color: '#0f172a', marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', fontWeight: '600' }}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChangeText={(t) => setForm(p => ({ ...p, [field.key]: t }))}
                />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center' }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontWeight: '800', color: '#64748b' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 2, padding: 16, borderRadius: 16, backgroundColor: '#2563eb', alignItems: 'center', opacity: submitting ? 0.7 : 1 }}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="white" /> : <Text style={{ fontWeight: '900', color: 'white' }}>Đăng ký</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
