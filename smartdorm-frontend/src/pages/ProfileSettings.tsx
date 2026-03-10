import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'
import { usersApi } from '../api/users'
import { uploadApi } from '../api/upload'

export default function ProfileSettings() {
  const { user, login } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  
  // Profile State
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

  // Security State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (user) {
      // Load detailed user info
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
      
      const payload = {
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        idCardNumber: profileForm.idCardNumber,
        address: profileForm.address,
        avatarUrl: finalAvatarUrl
      }
      
      const res = await usersApi.updateMe(payload)
      setProfileForm(prev => ({ ...prev, avatarUrl: finalAvatarUrl }))
      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' })
      // Update local context if necessary by re-fetching me or manually patching (auth provider handles it via token mostly, but let's re-login/refresh if needed)
      // Since context doesn't have a `setUser` direct method, a page reload or relying on authApi.me works. 
      // We will just show success.
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ' })
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
      setSecurityMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu' })
    } finally {
      setSecurityLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cài đặt Tài khoản</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl text-left transition-colors flex items-center gap-2.5 ${activeTab === 'profile' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Hồ sơ cá nhân
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl text-left transition-colors flex items-center gap-2.5 ${activeTab === 'security' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Đổi mật khẩu
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Thông tin công khai</h2>
              
              {profileMessage.text && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                  {profileMessage.text}
                </div>
              )}

              <div className="flex items-center gap-6">
                <div className="relative relative w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border-4 border-white shadow-md overflow-hidden group">
                  <img 
                    src={avatarFile ? URL.createObjectURL(avatarFile) : (profileForm.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=c7d2fe&color=3730a3&bold=true&size=128`)} 
                    alt="Avatar View"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Ảnh đại diện</h3>
                  <p className="text-xs text-slate-500 mt-1">Hỗ trợ JPG, PNG, GIF dưới 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số CCCD / CMND</label>
                  <input
                    type="text"
                    value={profileForm.idCardNumber}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, idCardNumber: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ thường trú</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {profileLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSecuritySubmit} className="space-y-6 max-w-md">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Bảo mật</h2>
              
              {securityMessage.text && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${securityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                  {securityMessage.text}
                </div>
              )}

              <div className="space-y-5 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại <span className="text-rose-500">*</span></label>
                  <input
                    type="password"
                    required
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                    placeholder="••••••••"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Bỏ trống nếu tài khoản này đăng nhập bằng Google.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới <span className="text-rose-500">*</span></label>
                  <input
                    type="password"
                    required
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nhập lại mật khẩu mới <span className="text-rose-500">*</span></label>
                  <input
                    type="password"
                    required
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {securityLoading ? 'Đang đổi...' : 'Cập nhật Mật khẩu'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
