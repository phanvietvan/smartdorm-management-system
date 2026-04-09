import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { paymentsApi } from '../api';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: '#f97316', bg: '#fff7ed', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
  failed: { label: 'Thất bại', color: '#dc2626', bg: '#fef2f2', icon: XCircle },
};

const METHOD_LABEL = { vnpay: 'VNPAY', cash: 'Tiền mặt', transfer: 'Chuyển khoản' };

export default function PaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await paymentsApi.getHistory();
      setPayments(res.data?.data?.payments || res.data?.payments || res.data || []);
    } catch (e) {
      console.error('Payments fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;
    return (
      <View style={{ backgroundColor: 'white', padding: 18, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ backgroundColor: cfg.bg, padding: 12, borderRadius: 16, marginRight: 14 }}>
              <CreditCard size={20} color={cfg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 14 }}>{(item.amount || 0).toLocaleString('vi-VN')} ₫</Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{METHOD_LABEL[item.method] || item.method}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <StatusIcon size={12} color={cfg.color} />
                <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700', marginLeft: 4 }}>{cfg.label}</Text>
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        </View>
        {item.orderInfo ? (
          <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' }} numberOfLines={2}>
            {item.orderInfo}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 }}>Lịch sử thanh toán</Text>
        <Text style={{ color: '#64748b', fontWeight: '600', marginTop: 4 }}>Tất cả giao dịch của bạn</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <CreditCard size={48} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontWeight: '700', marginTop: 16, fontSize: 15 }}>Chưa có giao dịch nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
