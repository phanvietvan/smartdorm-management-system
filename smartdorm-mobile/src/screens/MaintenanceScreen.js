import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, Plus, ChevronRight, Clock, CheckCircle, XCircle, Loader } from 'lucide-react-native';
import { maintenanceApi } from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  pending: { label: 'Đang chờ', color: '#f97316', bg: '#fff7ed', icon: Clock },
  in_progress: { label: 'Đang xử lý', color: '#2563eb', bg: '#eff6ff', icon: Loader },
  resolved: { label: 'Đã giải quyết', color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
  rejected: { label: 'Từ chối', color: '#dc2626', bg: '#fef2f2', icon: XCircle },
};

export default function MaintenanceScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await maintenanceApi.getAll();
      setRequests(res.data?.requests || res.data || []);
    } catch (e) {
      console.error('Maintenance fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và mô tả');
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceApi.create({ title, description });
      setModalVisible(false);
      setTitle('');
      setDescription('');
      fetchData();
      Alert.alert('Thành công', 'Yêu cầu bảo trì đã được gửi');
    } catch (e) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;
    return (
      <View style={{ backgroundColor: 'white', padding: 18, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ backgroundColor: cfg.bg, padding: 12, borderRadius: 16, marginRight: 14 }}>
            <Wrench size={20} color={cfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 14, marginBottom: 4 }}>{item.title}</Text>
            <Text style={{ color: '#64748b', fontSize: 12, lineHeight: 18 }} numberOfLines={2}>{item.description}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <StatusIcon size={12} color={cfg.color} />
              <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700', marginLeft: 4 }}>{cfg.label}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 11, marginLeft: 12 }}>
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 }}>Bảo trì</Text>
          <Text style={{ color: '#64748b', fontWeight: '600', marginTop: 4 }}>Yêu cầu sửa chữa</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: '800', marginLeft: 6, fontSize: 13 }}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Wrench size={48} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontWeight: '700', marginTop: 16, fontSize: 15 }}>Không có yêu cầu bảo trì</Text>
            </View>
          }
        />
      )}

      {/* Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 20 }}>Yêu cầu bảo trì mới</Text>
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Tiêu đề</Text>
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' }}
              placeholder="VD: Bóng đèn bị hỏng"
              value={title}
              onChangeText={setTitle}
            />
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Mô tả chi tiết</Text>
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, fontSize: 14, color: '#0f172a', marginBottom: 24, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0' }}
              placeholder="Mô tả vấn đề cần sửa chữa..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center' }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontWeight: '800', color: '#64748b' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 2, padding: 16, borderRadius: 16, backgroundColor: '#2563eb', alignItems: 'center', opacity: submitting ? 0.7 : 1 }}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="white" /> : <Text style={{ fontWeight: '900', color: 'white' }}>Gửi yêu cầu</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
