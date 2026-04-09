import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, activityIndicator, ActivityIndicator, TextInput, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Lock, Phone, Edit2, ChevronRight, Bell, Shield, Home } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive', onPress: async () => {
          await logout();
          navigation.replace('Login');
        }
      }
    ]);
  };

  const handleSaveProfile = async () => {
    if (!fullName) {
      Alert.alert('Lỗi', 'Họ tên không được để trống');
      return;
    }
    setSaving(true);
    try {
      await usersApi.updateProfile({ fullName, phone });
      await refreshUser();
      setEditing(false);
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
    } catch (e) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const ROLE_LABEL = { admin: 'Quản trị viên', tenant: 'Người thuê', manager: 'Quản lý', landlord: 'Chủ trọ', guest: 'Khách' };
  const roleLabel = ROLE_LABEL[user?.role] || 'Khách';
  const initials = (user?.fullName || '?').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Avatar section */}
        <View style={{ alignItems: 'center', paddingTop: 36, paddingBottom: 28, backgroundColor: 'white', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 20 }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900' }}>{initials}</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 14, letterSpacing: -0.3 }}>{user?.fullName}</Text>
          <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 6 }}>
            <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 12 }}>{roleLabel}</Text>
          </View>
          {user?.roomId && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Home size={14} color="#94a3b8" />
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                Phòng {typeof user.roomId === 'object' ? user.roomId.name : user.roomId}
              </Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Profile info edit */}
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontWeight: '900', color: '#0f172a', fontSize: 15 }}>Thông tin cá nhân</Text>
              <TouchableOpacity onPress={() => setEditing(!editing)}>
                <Edit2 size={18} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email</Text>
            <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 14, marginBottom: 16 }}>{user?.email}</Text>

            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Họ và tên</Text>
            {editing ? (
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '600', color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 }}
                value={fullName}
                onChangeText={setFullName}
              />
            ) : (
              <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 14, marginBottom: 16 }}>{user?.fullName}</Text>
            )}

            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Số điện thoại</Text>
            {editing ? (
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '600', color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0' }}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 14 }}>{user?.phone || 'Chưa cập nhật'}</Text>
            )}

            {editing && (
              <TouchableOpacity
                style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 16, opacity: saving ? 0.7 : 1 }}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900' }}>Lưu thay đổi</Text>}
              </TouchableOpacity>
            )}
          </View>

          {/* Menu items */}
          {[
            { icon: Bell, label: 'Thông báo', color: '#eff6ff', iconColor: '#2563eb', screen: 'Notifications' },
            { icon: Lock, label: 'Đổi mật khẩu', color: '#f0fdf4', iconColor: '#16a34a' },
            { icon: Shield, label: 'Bảo mật', color: '#fdf4ff', iconColor: '#9333ea' },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ backgroundColor: 'white', padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: item.color, padding: 10, borderRadius: 14, marginRight: 14 }}>
                  <item.icon size={20} color={item.iconColor} />
                </View>
                <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 15 }}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity
            style={{ marginTop: 12, backgroundColor: '#fef2f2', padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fecaca' }}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#dc2626" />
            <Text style={{ color: '#dc2626', fontWeight: '900', fontSize: 15, marginLeft: 10 }}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
