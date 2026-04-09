import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Check, CheckCheck } from 'lucide-react-native';
import { notificationsApi } from '../api';

const TYPE_COLORS = {
  bill: '#f97316', payment: '#059669', maintenance: '#8b5cf6',
  visitor: '#0284c7', system: '#64748b', general: '#2563eb',
  broadcast: '#dc2626', message: '#6366f1', contract: '#ca8a04',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await notificationsApi.getAll({ limit: 50 });
      setNotifications(res.data?.data || res.data || []);
    } catch (e) {
      console.error('Notifications error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const renderItem = ({ item }) => {
    const color = TYPE_COLORS[item.type] || '#64748b';
    return (
      <TouchableOpacity
        style={{ backgroundColor: item.isRead ? 'white' : '#eff6ff', padding: 18, borderRadius: 18, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderLeftWidth: 3, borderLeftColor: item.isRead ? '#e2e8f0' : color }}
        onPress={() => markAsRead(item._id)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ backgroundColor: color + '20', padding: 10, borderRadius: 14, marginRight: 14 }}>
            <Bell size={18} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: item.isRead ? '600' : '800', color: '#0f172a', fontSize: 14, marginBottom: 4 }}>{item.title}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 18 }}>{item.message}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 6, fontWeight: '600' }}>
              {new Date(item.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>
          {!item.isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginTop: 4 }} />}
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 }}>Thông báo</Text>
          {unreadCount > 0 && (
            <Text style={{ color: '#2563eb', fontWeight: '700', marginTop: 4, fontSize: 13 }}>{unreadCount} chưa đọc</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
            onPress={markAllRead}
          >
            <CheckCheck size={16} color="#2563eb" />
            <Text style={{ color: '#2563eb', fontWeight: '700', marginLeft: 6, fontSize: 12 }}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Bell size={48} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontWeight: '700', marginTop: 16, fontSize: 15 }}>Chưa có thông báo nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
