import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Receipt, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { billsApi, paymentsApi } from '../api';

const STATUS_CONFIG = {
  unpaid: { label: 'Chưa thanh toán', color: '#f97316', bg: '#fff7ed', icon: Clock },
  paid: { label: 'Đã thanh toán', color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
  overdue: { label: 'Quá hạn', color: '#dc2626', bg: '#fef2f2', icon: XCircle },
};

export default function BillDetailScreen({ navigation, route }) {
  const { billId } = route.params;
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await billsApi.getById(billId);
        setBill(res.data);
      } catch (e) {
        console.error('BillDetail error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [billId]);

  const handlePay = async () => {
    Alert.alert('Thanh toán', 'Xác nhận thanh toán hóa đơn qua VNPAY?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Thanh toán', onPress: async () => {
          setPaying(true);
          try {
            const res = await paymentsApi.createVnpayUrl({
              billId: bill._id,
              amount: bill.totalAmount || bill.amount,
            });
            const url = res.data?.vnpUrl;
            if (url) await Linking.openURL(url);
          } catch (e) {
            Alert.alert('Lỗi', 'Không thể khởi tạo thanh toán');
          } finally {
            setPaying(false);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#94a3b8', fontWeight: '700' }}>Không tìm thấy hóa đơn</Text>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[bill.status] || STATUS_CONFIG.unpaid;
  const StatusIcon = cfg.icon;

  const items = [
    { label: 'Tiền phòng', value: bill.roomFee },
    { label: 'Tiền điện', value: bill.electricFee },
    { label: 'Tiền nước', value: bill.waterFee },
    { label: 'Dịch vụ khác', value: bill.serviceFee },
    { label: 'Phí khác', value: bill.otherFee },
  ].filter(i => i.value > 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ backgroundColor: '#2563eb', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 }}>
        <SafeAreaView>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
          >
            <ChevronLeft size={22} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </SafeAreaView>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Chi tiết hóa đơn</Text>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '900' }}>Tháng {bill.month}/{bill.year}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <StatusIcon size={14} color="rgba(255,255,255,0.7)" />
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', marginLeft: 6 }}>{cfg.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Bill items */}
        <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ fontWeight: '900', color: '#0f172a', fontSize: 15, marginBottom: 16 }}>Chi tiết khoản thu</Text>
          {items.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: idx < items.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ color: '#64748b', fontWeight: '600', fontSize: 14 }}>{item.label}</Text>
              <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 14 }}>{(item.value || 0).toLocaleString('vi-VN')} ₫</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, marginTop: 4, borderTopWidth: 2, borderTopColor: '#f1f5f9' }}>
            <Text style={{ fontWeight: '900', color: '#0f172a', fontSize: 16 }}>Tổng cộng</Text>
            <Text style={{ fontWeight: '900', color: '#2563eb', fontSize: 18 }}>{(bill.totalAmount || bill.amount || 0).toLocaleString('vi-VN')} ₫</Text>
          </View>
        </View>

        {/* Metadata */}
        {bill.dueDate && (
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ color: '#64748b', fontWeight: '600', fontSize: 14 }}>Hạn thanh toán</Text>
            <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 14, marginTop: 4 }}>
              {new Date(bill.dueDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}
      </ScrollView>

      {bill.status === 'unpaid' && (
        <View style={{ backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <TouchableOpacity
            style={{ backgroundColor: '#2563eb', padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: paying ? 0.7 : 1, shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 }}
            onPress={handlePay}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <CreditCard size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 16, marginLeft: 10, textTransform: 'uppercase' }}>Thanh toán VNPAY</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
