import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'
import { usersApi } from '../api/users'
import { uploadApi } from '../api/upload'
import { motion, AnimatePresence } from 'framer-motion'

type TabId = 'profile' | 'settings' | 'notification' | 'security' | 'data' | 'language'

const translations = {
  vi: {
    title: 'Cài đặt',
    subtitle: 'Quản lý tùy chọn tài khoản và cấu hình hệ thống.',
    tabs: { profile: 'Hồ sơ', notification: 'Thông báo', security: 'Bảo mật', data: 'Dữ liệu & Riêng tư', language: 'Ngôn ngữ' },
    profile: {
      title: 'Thông tin cá nhân',
      fullName: 'Họ và tên',
      email: 'Địa chỉ Email',
      phone: 'Số điện thoại',
      location: 'Địa chỉ / Vị trí',
      bio: 'Tiểu sử chuyên môn',
      save: 'Lưu thay đổi',
      sync: 'Đồng bộ hệ thống',
      syncDesc: 'Tài khoản của bạn được đồng bộ với Cổng thông tin SmartDorm.',
      lastUpdated: 'Cập nhật lần cuối'
    },
    security: {
      title: 'Thiết lập bảo mật',
      currentPass: 'Mật khẩu hiện tại',
      newPass: 'Mật khẩu mới',
      confirmPass: 'Xác nhận mật khẩu mới',
      update: 'Cập nhật mật khẩu',
      placeholder: '••••••••'
    },
    notification: {
      title: 'Tùy chọn thông báo',
      push: 'Thông báo đẩy',
      pushDesc: 'Nhận cảnh báo về hóa đơn phòng và yêu cầu bảo trì.',
      email: 'Thông báo Email',
      emailDesc: 'Gửi bản sao hóa đơn qua hòm thư điện tử.'
    },
    data: {
      title: 'Dữ liệu & Quyền riêng tư',
      history: 'Lịch sử hoạt động',
      historyDesc: 'Quản lý và xem nhật ký đăng nhập và tương tác hệ thống.',
      download: 'Tải xuống dữ liệu của tôi',
      delete: 'Xóa tài khoản',
      deleteDesc: 'Hành động này sẽ xóa vĩnh viễn dữ liệu của bạn và không thể hoàn tác.',
      requestDelete: 'Yêu cầu xóa tài khoản'
    },
    language: {
      title: 'Ngôn ngữ giao diện',
      vi: 'Tiếng Việt',
      en: 'Tiếng Anh',
      viDesc: 'Ngôn ngữ mặc định',
      enDesc: 'Ngôn ngữ quốc tế'
    },
    stats: { health: 'Sức khỏe tài khoản', login: 'Lần đăng nhập cuối', tokens: 'Phiên hoạt động', excellent: 'Tuyệt vời', active: 'Đang hoạt động' }
  },
  en: {
    title: 'Settings',
    subtitle: 'Manage your account preferences and system configurations.',
    tabs: { profile: 'Profile', notification: 'Notifications', security: 'Security', data: 'Data & Privacy', language: 'Language' },
    profile: {
      title: 'Profile Information',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      location: 'Location / Address',
      bio: 'Professional Bio',
      save: 'Save Changes',
      sync: 'System Connectivity',
      syncDesc: 'Your account is synced with SmartDorm Enterprise Portal.',
      lastUpdated: 'Last Updated'
    },
    security: {
      title: 'Security Settings',
      currentPass: 'Current Password',
      newPass: 'New Password',
      confirmPass: 'Confirm New Password',
      update: 'Update Password',
      placeholder: '••••••••'
    },
    notification: {
      title: 'Notifications',
      push: 'Push Notifications',
      pushDesc: 'Receive alerts about room bills and maintenance requests.',
      email: 'Email Alerts',
      emailDesc: 'Send invoice copies to your email inbox.'
    },
    data: {
      title: 'Data & Privacy',
      history: 'Activity History',
      historyDesc: 'Manage and view your login activity and system interactions.',
      download: 'Download My Data',
      delete: 'Delete Account',
      deleteDesc: 'This action permanently deletes your data and cannot be undone.',
      requestDelete: 'Request Account Deletion'
    },
    language: {
      title: 'Language Preferences',
      vi: 'Vietnamese',
      en: 'English',
      viDesc: 'Default language',
      enDesc: 'International language'
    },
    stats: { health: 'Account Health', login: 'Last Login', tokens: 'Auth Tokens', excellent: 'Excellent', active: 'Active' }
  }
}

export default function ProfileSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [langCode, setLangCode] = useState<'vi' | 'en'>(() => (localStorage.getItem('language') as any) || 'vi')
  
  const t = translations[langCode]

  const [profileForm, setProfileForm] = useState({ 
    fullName: '', 
    phone: '', 
    idCardNumber: '', 
    address: '', 
    avatarUrl: '',
    studentId: '',
    email: '' 
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })

  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' })

  const [notifSetting, setNotifSetting] = useState({ push: true, email: false })

  const [userRoomInfo, setUserRoomInfo] = useState({ room: '', block: '' })

  useEffect(() => {
    if (user) {
      authApi.me().then(res => {
        const u = res.data.user
        setProfileForm({
          fullName: u.fullName || u.name || '',
          phone: u.phone || u.phoneNumber || '',
          idCardNumber: u.idCardNumber || '',
          address: u.address || '',
          avatarUrl: u.avatarUrl || '',
          studentId: u.studentId || u.username || '',
          email: u.email || ''
        })
        const r = u.room || u.roomId
        setUserRoomInfo({
          room: r?.roomNumber || r?.name || 'P238',
          block: r?.block || r?.building || 'Cơ sở 1'
        })
      }).catch(() => {})
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage({ type: '', text: '' })
    try {
      let finalAvatarUrl = profileForm.avatarUrl
      if (avatarFile) {
        const uploadRes = await uploadApi.uploadFile(avatarFile)
        finalAvatarUrl = uploadRes.data.fileUrl
      }
      await usersApi.updateMe({ ...profileForm, avatarUrl: finalAvatarUrl })
      setProfileMessage({ type: 'success', text: langCode === 'vi' ? 'Cập nhật thành công!' : 'Update successful!' })
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Error occurred.' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return setSecurityMessage({ type: 'error', text: langCode === 'vi' ? 'Mật khẩu xác nhận không khớp!' : 'Passwords do not match!' })
    }
    setSecurityLoading(true)
    try {
      await authApi.changePassword({ ...securityForm })
      setSecurityMessage({ type: 'success', text: langCode === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password changed!' })
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setSecurityMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi đổi mật khẩu.' })
    } finally {
      setSecurityLoading(false)
    }
  }

  const changeLanguage = (code: 'vi' | 'en') => {
    setLangCode(code)
    localStorage.setItem('language', code)
  }

  const avatarSrc = avatarFile ? URL.createObjectURL(avatarFile) : (profileForm.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=4b49cb&color=fff&bold=true&size=150`)

  return (
    <main className="pt-4 pb-12 min-h-screen font-['Plus_Jakarta_Sans',_sans-serif] bg-[#f5f6f9] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div className="max-w-6xl mx-auto px-6">
        
        <header className="mb-12">
          <h2 className="text-[2.75rem] font-extrabold tracking-tight text-[#2c2f31] leading-tight">{t.title}</h2>
          <p className="text-[#595c5e] text-lg font-medium">{t.subtitle}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Side Nav */}
          <nav className="w-full lg:w-64 space-y-3 sticky top-28 bg-[#f5f6f9] z-10">
            {[
              { id: 'profile', label: t.tabs.profile, icon: 'person' },
              { id: 'notification', label: t.tabs.notification, icon: 'notifications_active' },
              { id: 'security', label: t.tabs.security, icon: 'security' },
              { id: 'data', label: t.tabs.data, icon: 'database' },
              { id: 'language', label: t.tabs.language, icon: 'language' },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id as TabId)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-full transition-all duration-300 ${activeTab === item.id ? 'bg-[#cbceff] text-[#4b49cb] font-extrabold shadow-[0_4px_12px_rgba(75,73,203,0.1)]' : 'text-[#595c5e] hover:bg-[#e6e8ec] font-semibold'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span className="text-[13px] tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Card */}
          <div className="flex-1 w-full bg-white rounded-[2.5rem] p-12 shadow-[0_12px_40px_rgba(44,47,49,0.06)] min-h-[600px]">
            <AnimatePresence mode="wait">
              
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }}>
                  <div className="flex justify-between items-start mb-14">
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        <img src={avatarSrc} className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white" alt="" />
                        <label className="absolute -bottom-3 -right-3 bg-[#4b49cb] text-white p-2.5 rounded-xl shadow-xl cursor-pointer hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-lg">edit</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-[#2c2f31]">{profileForm.fullName || 'User Name'}</h3>
                        <p className="text-[#595c5e] text-sm font-semibold mb-3">{user?.email}</p>
                        <span className="bg-[#fc8bcd]/20 text-[#610246] px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">{user?.role === 'admin' ? 'SENIOR ADMINISTRATOR' : user?.role?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  {profileMessage.text && <div className={`mb-8 p-4 rounded-2xl text-sm font-medium border ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{profileMessage.text}</div>}
                  <form onSubmit={handleProfileSubmit} className="space-y-10">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div><label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">{t.profile.fullName}</label>
                            <input className="w-full bg-[#dadde1] border-none rounded-full px-8 py-4.5 text-[#2c2f31] font-bold focus:ring-2 focus:ring-[#4b49cb]/20 transition-all" type="text" value={profileForm.fullName} onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))} /></div>
                            
                            <div><label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">Mã cư dân / ID</label>
                            <input className="w-full bg-[#dadde1]/60 border-none rounded-full px-8 py-4.5 text-[#2c2f31]/60 font-bold cursor-not-allowed" type="text" value={profileForm.studentId} disabled /></div>

                            <div><label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">{t.profile.email}</label>
                            <input className="w-full bg-[#dadde1]/60 border-none rounded-full px-8 py-4.5 text-[#2c2f31]/60 font-bold pl-14 cursor-not-allowed" type="email" value={profileForm.email} disabled /></div>
                        </div>
                        <div className="space-y-8">
                            <div><label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">{t.profile.phone}</label>
                            <input className="w-full bg-[#dadde1] border-none rounded-full px-8 py-4.5 text-[#2c2f31] font-bold pl-14" type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} /></div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">Phòng</label>
                              <input className="w-full bg-[#dadde1]/60 border-none rounded-full px-8 py-4.5 text-[#2c2f31]/60 font-bold cursor-not-allowed" type="text" value={userRoomInfo.room} disabled /></div>
                              <div><label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">Tòa nhà</label>
                              <input className="w-full bg-[#dadde1]/60 border-none rounded-full px-8 py-4.5 text-[#2c2f31]/60 font-bold cursor-not-allowed" type="text" value={userRoomInfo.block} disabled /></div>
                            </div>

                            <div><label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">Số CMND/CCCD</label>
                            <input className="w-full bg-[#dadde1] border-none rounded-full px-8 py-4.5 text-[#2c2f31] font-bold" type="text" value={profileForm.idCardNumber} onChange={e => setProfileForm(p => ({ ...p, idCardNumber: e.target.value }))} /></div>
                        </div>
                    </div>
                    <div><label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">{t.profile.location}</label>
                    <input className="w-full bg-[#dadde1] border-none rounded-full px-8 py-4.5 text-[#2c2f31] font-bold" type="text" value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} /></div>

                    <button type="submit" disabled={profileLoading} className="bg-gradient-to-br from-[#4b49cb] to-[#9596ff] text-white px-10 py-5 rounded-2xl font-black text-sm tracking-widest shadow-lg hover:scale-[1.02] transition-all flex items-center gap-4">
                      <span>{profileLoading ? '...' : t.profile.save.toUpperCase()}</span>
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-extrabold tracking-tight text-[#2c2f31] mb-12">{t.security.title}</h3>
                  {securityMessage.text && <div className={`mb-8 p-4 rounded-2xl text-sm font-medium border ${securityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{securityMessage.text}</div>}
                  <form onSubmit={handleSecuritySubmit} className="max-w-md space-y-8">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">{t.security.currentPass}</label>
                      <input className="w-full bg-[#dadde1] border-none rounded-full px-8 py-4.5 text-[#2c2f31] font-bold focus:ring-2 focus:ring-[#4b49cb]/20 transition-all" type="password" value={securityForm.currentPassword} onChange={e => setSecurityForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder={t.security.placeholder} />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">{t.security.newPass}</label>
                      <input className="w-full bg-[#dadde1] border-none rounded-full px-8 py-4.5 text-[#2c2f31] font-bold focus:ring-2 focus:ring-[#4b49cb]/20 transition-all" type="password" value={securityForm.newPassword} onChange={e => setSecurityForm(p => ({ ...p, newPassword: e.target.value }))} placeholder={t.security.placeholder} />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#75777a] mb-3 block">{t.security.confirmPass}</label>
                      <input className="w-full bg-[#dadde1] border-none rounded-full px-8 py-4.5 text-[#2c2f31] font-bold focus:ring-2 focus:ring-[#4b49cb]/20 transition-all" type="password" value={securityForm.confirmPassword} onChange={e => setSecurityForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder={t.security.placeholder} />
                    </div>
                    <button type="submit" disabled={securityLoading} className="bg-[#4b49cb] text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-[#3e3bbf] shadow-xl shadow-indigo-100 transition-all">
                      {securityLoading ? '...' : t.security.update}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'notification' && (
                <motion.div key="notification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-extrabold tracking-tight text-[#2c2f31] mb-12">{t.notification.title}</h3>
                  <div className="flex flex-col gap-8 max-w-2xl">
                    <div className="bg-[#eff1f4] p-10 rounded-[3rem] border border-[#dadde1]/50 flex items-center justify-between shadow-sm transition-all hover:bg-white hover:shadow-xl hover:border-[#4b49cb]/20 group">
                      <div className="flex items-center gap-8">
                        <span className="material-symbols-outlined p-5 bg-white rounded-3xl text-[#4b49cb] shadow-sm transform group-hover:rotate-12 transition-transform">notifications</span>
                        <div><p className="font-extrabold text-[#2c2f31] text-xl mb-1">{t.notification.push}</p><p className="text-sm text-[#595c5e] font-medium leading-relaxed">{t.notification.pushDesc}</p></div>
                      </div>
                      <button onClick={() => setNotifSetting(p => ({...p, push: !p.push}))} className={`w-16 h-9 rounded-full transition-all flex items-center px-1.5 ${notifSetting.push ? 'bg-[#4b49cb] justify-end' : 'bg-[#dadde1] justify-start'}`}><div className="w-6 h-6 bg-white rounded-full shadow-lg" /></button>
                    </div>
                    <div className="bg-[#eff1f4] p-10 rounded-[3rem] border border-[#dadde1]/50 flex items-center justify-between shadow-sm transition-all hover:bg-white hover:shadow-xl hover:border-[#4b49cb]/20 group">
                      <div className="flex items-center gap-8">
                        <span className="material-symbols-outlined p-5 bg-white rounded-3xl text-[#fc8bcd] shadow-sm transform group-hover:-rotate-12 transition-transform">mail</span>
                        <div><p className="font-extrabold text-[#2c2f31] text-xl mb-1">{t.notification.email}</p><p className="text-sm text-[#595c5e] font-medium leading-relaxed">{t.notification.emailDesc}</p></div>
                      </div>
                      <button onClick={() => setNotifSetting(p => ({...p, email: !p.email}))} className={`w-16 h-9 rounded-full transition-all flex items-center px-1.5 ${notifSetting.email ? 'bg-[#4b49cb] justify-end' : 'bg-[#dadde1] justify-start'}`}><div className="w-6 h-6 bg-white rounded-full shadow-lg" /></button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'data' && (
                <motion.div key="data" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-extrabold tracking-tight text-[#2c2f31] mb-12">{t.data.title}</h3>
                  <div className="flex flex-col gap-8 max-w-2xl">
                    <div className="bg-[#eff1f4] p-10 rounded-[3rem] border border-[#dadde1]/50 shadow-sm transition-all hover:bg-white hover:shadow-xl hover:border-[#4b49cb]/20 group">
                      <div className="flex items-center gap-8 mb-8">
                        <span className="material-symbols-outlined p-5 bg-white rounded-3xl text-[#4b49cb] shadow-sm transform group-hover:rotate-12 transition-transform">history</span>
                        <div><p className="font-extrabold text-[#2c2f31] text-xl mb-1">{t.data.history}</p><p className="text-sm text-[#595c5e] font-medium leading-relaxed">{t.data.historyDesc}</p></div>
                      </div>
                      <button className="bg-white text-[#2c2f31] px-10 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-[#4b49cb] hover:text-white transition-all flex items-center gap-3"><span className="material-symbols-outlined text-sm">download</span>{t.data.download}</button>
                    </div>
                    <div className="bg-rose-50/50 p-10 rounded-[3rem] border border-rose-100 shadow-sm hover:bg-rose-50 transition-all">
                      <div className="flex items-center gap-8 mb-8">
                        <span className="material-symbols-outlined p-5 bg-white rounded-3xl text-rose-500 shadow-sm">delete_forever</span>
                        <div><p className="font-extrabold text-rose-900 text-xl mb-1">{t.data.delete}</p><p className="text-sm text-rose-700 font-medium leading-relaxed">{t.data.deleteDesc}</p></div>
                      </div>
                      <button className="bg-rose-500 text-white px-10 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-600 hover:scale-[1.02] transition-all">{t.data.requestDelete}</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'language' && (
                <motion.div key="language" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <h3 className="text-3xl font-extrabold tracking-tight text-[#2c2f31] mb-12">{t.language.title}</h3>
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { id: 'vi', label: t.language.vi, desc: t.language.viDesc, flag: '🇻🇳' },
                      { id: 'en', label: t.language.en, desc: t.language.enDesc, flag: '🇺🇸' }
                    ].map(lang => (
                      <button key={lang.id} onClick={() => changeLanguage(lang.id as any)} className={`p-10 rounded-[3rem] border-2 transition-all flex items-center justify-between ${langCode === lang.id ? 'border-[#4b49cb] bg-[#cbceff]/30 shadow-2xl' : 'border-transparent bg-[#eff1f4] hover:bg-white hover:border-[#dadde1]'}`}>
                        <div className="text-left flex items-center gap-6">
                            <span className="text-5xl drop-shadow-sm">{lang.flag}</span>
                            <div><p className="font-extrabold text-2xl text-[#2c2f31]">{lang.label}</p><p className="text-sm font-semibold text-[#595c5e] mt-1">{lang.desc}</p></div>
                        </div>
                        {langCode === lang.id && <span className="material-symbols-outlined text-[#4b49cb] text-4xl animate-pulse">check_circle</span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-16 grid grid-cols-3 gap-10">
          {[
            { label: t.stats.health, val: t.stats.excellent, icon: 'verified_user', color: '#4b49cb' },
            { label: t.stats.login, val: '2 hours ago', icon: 'history', color: '#fc8bcd' },
            { label: t.stats.tokens, val: t.stats.active, icon: 'token', color: '#4650b9' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#eff1f4] p-12 rounded-[3.5rem] flex flex-col justify-between h-56 border border-[#dadde1]/30 shadow-sm transition-all hover:bg-white hover:shadow-2xl hover:scale-[1.02] group">
              <span className="material-symbols-outlined text-5xl transform group-hover:scale-110 transition-transform" style={{ color: stat.color }}>{stat.icon}</span>
              <div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#75777a] mb-2">{stat.label}</p><h4 className="text-2xl font-black text-[#2c2f31]">{stat.val}</h4></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
