import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Receipt, Bell, Wrench, ChevronRight, UserCheck, Building2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, notificationsApi, billsApi } from '../api';

const StatCard = ({ label, value, color, bgColor }) => (
  <View style={{ backgroundColor: bgColor, padding: 18, borderRadius: 24, flex: 1, marginHorizontal: 4, shadowColor: bgColor, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
    <Text style={{ color: color + 'cc', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{label}</Text>
    <Text style={{ color: 'white', fontSize: 30, fontWeight: '900' }}>{value}</Text>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, unreadRes, billsRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        notificationsApi.getUnreadCount(),
        billsApi.getAll({ status: 'unpaid' }),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (unreadRes.status === 'fulfilled') setUnreadCount(unreadRes.value.data.count || 0);
      if (billsRes.status === 'fulfilled') setPendingBills(billsRes.value.data?.bills || billsRes.value.data || []);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng,';
    if (h < 18) return 'Chào buổi chiều,';
    return 'Chào buổi tối,';
  };

  const totalUnpaid = pendingBills.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, marginBottom: 28 }}>
          <View>
            <Text style={{ color: '#64748b', fontSize: 15, fontWeight: '500' }}>{greeting()}</Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 }}>
              {user?.fullName || 'Cư dân'}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
              {user?.role === 'admin' ? '🛡 Quản trị viên' : user?.role === 'tenant' ? '🏠 Người thuê' : '👤 Khách'}
            </Text>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: 'white', padding: 12, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, position: 'relative' }}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={24} color="#0f172a" />
            {unreadCount > 0 && (
              <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#ef4444', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: 9, fontWeight: '900' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <StatCard label="Phòng" value={stats?.rooms?.total || '—'} bgColor="#2563eb" color="#eff6ff" />
          <StatCard label="Hóa đơn" value={stats?.bills?.unpaid || pendingBills.length} bgColor="#f97316" color="#fff7ed" />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 28 }}>
          <StatCard label="Bảo trì" value={stats?.maintenance?.pending || '—'} bgColor="#8b5cf6" color="#f5f3ff" />
          <StatCard label="Cư dân" value={stats?.users?.total || '—'} bgColor="#059669" color="#ecfdf5" />
        </View>

        {/* Outstanding Bill */}
        {pendingBills.length > 0 && (
          <TouchableOpacity
            style={{ backgroundColor: 'white', padding: 20, borderRadius: 24, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#f97316', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#ffedd5' }}
            onPress={() => navigation.navigate('Bills')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#fff7ed', padding: 12, borderRadius: 18, marginRight: 16 }}>
                <Receipt size={22} color="#f97316" />
              </View>
              <View>
                <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>Hóa đơn chưa thanh toán</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 4 }}>
                  {totalUnpaid > 0 ? totalUnpaid.toLocaleString('vi-VN') + ' ₫' : `${pendingBills.length} hóa đơn`}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}

        {/* Quick Access */}
        <Text style={{ fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 16, letterSpacing: -0.3 }}>Truy cập nhanh</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[
            { label: 'Hóa đơn', icon: Receipt, color: '#fff7ed', iconColor: '#f97316', screen: 'Bills' },
            { label: 'Bảo trì', icon: Wrench, color: '#f0fdf4', iconColor: '#16a34a', screen: 'Maintenance' },
            { label: 'Thông báo', icon: Bell, color: '#eff6ff', iconColor: '#2563eb', screen: 'Notifications' },
            { label: 'Khách', icon: UserCheck, color: '#fdf4ff', iconColor: '#9333ea', screen: 'Visitors' },
            { label: 'Phòng', icon: Building2, color: '#f0f9ff', iconColor: '#0284c7', screen: 'Rooms' },
            { label: 'Thanh toán', icon: Receipt, color: '#fefce8', iconColor: '#ca8a04', screen: 'Payments' },
          ].map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={{ backgroundColor: 'white', padding: 16, borderRadius: 20, width: '47%', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={{ backgroundColor: item.color, padding: 10, borderRadius: 14, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <item.icon size={20} color={item.iconColor} />
              </View>
              <Text style={{ fontWeight: '800', color: '#0f172a', fontSize: 13 }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
