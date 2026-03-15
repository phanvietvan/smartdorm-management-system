import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'
import { usersApi } from '../api/users'
import { uploadApi } from '../api/upload'

type TabId = 'profile' | 'settings' | 'notification'

export default function ProfileSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  // Profile
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    idCardNumber: '',
    address: '',
    avatarUrl: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })

  // Security (trong tab Cài đặt)
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' })

  // Settings: theme & language
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState<'vi' | 'en'>('vi')
  const [notifSetting, setNotifSetting] = useState<'allow' | 'mute'>(() => localStorage.getItem('notifAllowed') === 'false' ? 'mute' : 'allow')

  useEffect(() => {
    if (user) {
      authApi.me().then(res => {
        setProfileForm({
          fullName: res.data.fullName || '',
          phone: (res.data as any).phone || '',
          idCardNumber: (res.data as any).idCardNumber || '',
          address: (res.data as any).address || '',
          avatarUrl: (res.data as any).avatarUrl || ''
        })
      }).catch(() => {})
    }
    const savedLang = localStorage.getItem('language') as 'vi' | 'en'
    if (savedLang === 'vi' || savedLang === 'en') setLanguage(savedLang)
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
      await usersApi.updateMe({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        idCardNumber: profileForm.idCardNumber,
        address: profileForm.address,
        avatarUrl: finalAvatarUrl
      })
      setProfileForm(prev => ({ ...prev, avatarUrl: finalAvatarUrl ?? '' }))
      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi cập nhật.' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return setSecurityMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' })
    }
    setSecurityLoading(true)
    setSecurityMessage({ type: '', text: '' })
    try {
      await authApi.changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      })
      setSecurityMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setSecurityMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi đổi mật khẩu.' })
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const avatarSrc = avatarFile
    ? URL.createObjectURL(avatarFile)
    : (profileForm.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=4f46e5&color=fff&bold=true&size=128`)

  const menuItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Hồ sơ của tôi', icon: <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'settings', label: 'Cài đặt', icon: <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'notification', label: 'Thông báo', icon: <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> }
  ]

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left card: Profile nav (avatar + name + email + menu) */}
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <img
                src={profileForm.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=4f46e5&color=fff&bold=true&size=80`}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-800 truncate">{user?.fullName || 'Người dùng'}</p>
                <p className="text-sm text-slate-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>
          <nav className="py-2">
            {menuItems.map(({ id, label, icon }) =>
              id === 'notification' ? (
                <div
                  key={id}
                  className={`w-full flex items-center justify-between px-5 py-3 text-sm font-medium transition-colors ${activeTab === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('notification')}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                  >
                    {icon}
                    {label}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setNotifSetting(s => { const next = s === 'allow' ? 'mute' : 'allow'; localStorage.setItem('notifAllowed', next === 'allow' ? 'true' : 'false'); return next; }); }}
                    className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    {notifSetting === 'allow' ? 'Bật' : 'Tắt'}
                  </button>
                </div>
              ) : (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-sm font-medium transition-colors ${activeTab === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-3">
                    {icon}
                    {label}
                  </span>
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              )
            )}
          </nav>
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Đăng xuất
              </span>
            </button>
          </div>
        </div>

        {/* Right card: Nội dung theo tab */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img src={avatarSrc} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-md" />
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">{user?.fullName || 'Tên của bạn'}</p>
                    <p className="text-sm text-slate-500">{user?.email || ''}</p>
                  </div>
                </div>
              </div>

              {profileMessage.text && (
                <div className={`mb-5 p-4 rounded-xl text-sm font-medium border ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                  {profileMessage.text}
                </div>
              )}

              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-100">
                  <label className="text-sm font-semibold text-slate-700 shrink-0 sm:w-32">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="flex-1 max-w-md px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Tên của bạn"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-100">
                  <label className="text-sm font-semibold text-slate-700 shrink-0 sm:w-32">Email</label>
                  <input type="text" disabled value={user?.email || ''} className="flex-1 max-w-md px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-100">
                  <label className="text-sm font-semibold text-slate-700 shrink-0 sm:w-32">Số điện thoại</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 max-w-md px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Thêm số điện thoại"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-100">
                  <label className="text-sm font-semibold text-slate-700 shrink-0 sm:w-32">Địa chỉ</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                    className="flex-1 max-w-md px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Thêm địa chỉ"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Cài đặt</h2>
              <div className="space-y-1 max-w-md">
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">Giao diện</span>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="light">Sáng</option>
                    <option value="dark">Tối</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">Ngôn ngữ</span>
                  <select
                    value={language}
                    onChange={(e) => {
                      const val = e.target.value as 'vi' | 'en'
                      setLanguage(val)
                      localStorage.setItem('language', val)
                      window.location.reload()
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4">Đổi mật khẩu</h3>
                {securityMessage.text && (
                  <div className={`mb-4 p-4 rounded-xl text-sm font-medium border ${securityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {securityMessage.text}
                  </div>
                )}
                <form onSubmit={handleSecuritySubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" disabled={securityLoading} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-70">
                    {securityLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notification' && (
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Thông báo</h2>
              <div className="flex items-center justify-between py-4 border-b border-slate-100 max-w-md">
                <span className="text-sm font-semibold text-slate-700">Nhận thông báo</span>
                <select
                  value={notifSetting}
                  onChange={(e) => setNotifSetting(e.target.value as 'allow' | 'mute')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="allow">Bật</option>
                  <option value="mute">Tắt</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
