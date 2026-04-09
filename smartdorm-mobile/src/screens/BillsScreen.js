import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Receipt, CheckCircle, Clock, XCircle, ChevronRight, CreditCard } from 'lucide-react-native';
import { billsApi, paymentsApi } from '../api';

const STATUS_CONFIG = {
  unpaid: { label: 'Chưa thanh toán', color: '#f97316', bg: '#fff7ed', icon: Clock },
  paid: { label: 'Đã thanh toán', color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
  overdue: { label: 'Quá hạn', color: '#dc2626', bg: '#fef2f2', icon: XCircle },
};

export default function BillsScreen({ navigation }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [paying, setPayingId] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await billsApi.getAll(params);
      setBills(res.data?.bills || res.data || []);
    } catch (e) {
      console.error('Bills fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const onRefresh = () => { setRefreshing(true); fetchBills(); };

  const handlePay = async (bill) => {
    Alert.alert(
      'Thanh toán qua VNPAY',
      `Thanh toán ${(bill.totalAmount || bill.amount || 0).toLocaleString('vi-VN')} ₫ cho tháng ${bill.month}/${bill.year}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thanh toán', onPress: async () => {
            setPayingId(bill._id);
            try {
              const res = await paymentsApi.createVnpayUrl({
                billId: bill._id,
                amount: bill.totalAmount || bill.amount,
              });
              const url = res.data?.vnpUrl;
              if (url) {
                await Linking.openURL(url);
              }
            } catch (e) {
              Alert.alert('Lỗi', e.response?.data?.message || 'Không thể khởi tạo thanh toán');
            } finally {
              setPayingId(null);
            }
          }
        }
      ]
    );
  };

  const renderBill = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.unpaid;
    const StatusIcon = cfg.icon;
    return (
      <TouchableOpacity
        style={{ backgroundColor: 'white', padding: 18, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
        onPress={() => navigation.navigate('BillDetail', { billId: item._id })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ backgroundColor: cfg.bg, padding: 12, borderRadius: 16, marginRight: 14 }}>
              <Receipt size={20} color={cfg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 14 }}>Tháng {item.month}/{item.year}</Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2, fontWeight: '600' }}>
                {(item.totalAmount || item.amount || 0).toLocaleString('vi-VN')} ₫
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <StatusIcon size={12} color={cfg.color} />
                <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700', marginLeft: 4 }}>{cfg.label}</Text>
              </View>
            </View>
          </View>
          {item.status === 'unpaid' ? (
            <TouchableOpacity
              style={{ backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', opacity: paying === item._id ? 0.6 : 1 }}
              onPress={() => handlePay(item)}
              disabled={paying === item._id}
            >
              {paying === item._id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <CreditCard size={14} color="white" />
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 12, marginLeft: 6 }}>Thanh toán</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <ChevronRight size={18} color="#94a3b8" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unpaid', label: 'Chưa TT' },
    { key: 'paid', label: 'Đã TT' },
    { key: 'overdue', label: 'Quá hạn' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 }}>Hóa đơn</Text>
        <Text style={{ color: '#64748b', fontWeight: '600', marginTop: 4 }}>Quản lý các khoản thanh toán</Text>

        {/* Filter chips */}
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === f.key ? '#2563eb' : 'white', borderWidth: 1.5, borderColor: filter === f.key ? '#2563eb' : '#e2e8f0' }}
              onPress={() => setFilter(f.key)}
            >
              <Text style={{ color: filter === f.key ? 'white' : '#64748b', fontWeight: '700', fontSize: 12 }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={bills}
          renderItem={renderBill}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Receipt size={48} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontWeight: '700', marginTop: 16, fontSize: 15 }}>Không có hóa đơn nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
