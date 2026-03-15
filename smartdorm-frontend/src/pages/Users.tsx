import { useEffect, useState } from 'react'
import { usersApi, type User } from '../api/users'
import { roomsApi, type Room } from '../api/rooms'
import { useAuth } from '../context/AuthContext'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [assigning, setAssigning] = useState(false)
  
  // Create User states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'tenant',
    password: 'password123',
    idCardNumber: '',
    address: '',
    roomId: ''
  })

  const canManage = currentUser && ['admin', 'manager', 'landlord'].includes(currentUser.role)

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, roomsRes] = await Promise.all([
        usersApi.getAll(),
        roomsApi.getAvailable()
      ])
      setUsers(usersRes.data)
      setRooms(roomsRes.data)
    } catch {
      setError('Không thể tải dữ liệu người dùng hoặc phòng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    manager: 'Quản lý',
    landlord: 'Chủ trọ',
    tenant: 'Người thuê',
    maintenance_staff: 'Sửa chữa',
    accountant: 'Kế toán',
    security: 'Bảo vệ',
    guest: 'Khách',
  }

  const handleApprove = async (u: User) => {
    if (!canManage) return
    setUpdatingId(u._id)
    try {
      await usersApi.approve(u._id)
      loadData()
    } catch {
      setError('Không thể duyệt người dùng, vui lòng thử lại')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleReject = async (u: User) => {
    if (!canManage) return
    setUpdatingId(u._id)
    try {
      await usersApi.reject(u._id)
      loadData()
    } catch {
      setError('Không thể từ chối người dùng, vui lòng thử lại')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleOpenAssignModal = (u: User) => {
    setSelectedUser(u)
    setSelectedRoomId('')
    setIsModalOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedUser || !selectedRoomId) return
    const room = rooms.find(r => r._id === selectedRoomId)
    setAssigning(true)
    try {
      await usersApi.assignTenant({ userId: selectedUser._id, roomId: selectedRoomId })
      await notificationsApi.createForUser({
        userId: selectedUser._id,
        title: 'Đã được gán phòng',
        content: room ? `Bạn đã được gán vào phòng ${room.name}.` : 'Bạn đã được gán phòng mới.',
        type: 'general',
      }).catch(() => {})
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi gán phòng')
    } finally {
      setAssigning(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManage) return
    setCreatingUser(true)
    setError('')
    
    try {
      const { roomId, ...userData } = userForm
      const { data: newUser } = await usersApi.create(userData as any)
      
      // Auto approve if created by admin/manager (BE gửi thông báo "Tài khoản đã được tạo" / duyệt / gán phòng)
      await usersApi.approve(newUser._id)

      if (roomId) {
        await usersApi.assignTenant({ userId: newUser._id, roomId })
      }

      setIsCreateModalOpen(false)
      setUserForm({
        fullName: '',
        email: '',
        phone: '',
        role: 'tenant',
        password: 'password123',
        idCardNumber: '',
        address: '',
        roomId: ''
      })
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tạo người dùng mới')
    } finally {
      setCreatingUser(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (error) return (
    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium flex items-center gap-3">
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      {error}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Tổng số người dùng: <span className="text-indigo-600 font-bold">{users.length}</span>
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Thêm người dùng
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phòng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                {canManage && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {users.map((u) => {
                const isGuest = u.role === 'guest'
                const isPending = (u as any).status === 'pending'

                return (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                          {u.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate">{u.fullName}</div>
                          <div className="text-xs text-slate-500 font-medium truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200/50' :
                        u.role === 'tenant' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                        'bg-slate-50 text-slate-700 border-slate-200/50'
                      }`}>
                        {roleLabel[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                      {u.roomId ? (typeof u.roomId === 'object' ? (u.roomId as any).name : u.roomId) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        isPending ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                      }`}>
                        {isPending ? 'Chờ duyệt' : 'Đã duyệt'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                                disabled={updatingId === u._id}
                                onClick={() => handleApprove(u)}
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all disabled:opacity-50"
                                disabled={updatingId === u._id}
                                onClick={() => window.confirm('Từ chối?') && handleReject(u)}
                              >
                                Bỏ
                              </button>
                            </>
                          ) : (
                            isGuest && (
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                                onClick={() => handleOpenAssignModal(u)}
                              >
                                Gán phòng
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Gán phòng cho người thuê</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Người nhận phòng</p>
                <div className="font-bold text-slate-800">{selectedUser?.fullName}</div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Chọn phòng trống</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-800"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  <option value="">-- Chọn một phòng --</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>{r.name} (Gía: {r.price?.toLocaleString()}₫)</option>
                  ))}
                </select>
                {rooms.length === 0 && (
                  <p className="text-xs text-rose-500 font-medium">Hiện không còn phòng nào trống!</p>
                )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Thêm người dùng mới</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Họ và tên <span className="text-rose-500">*</span></label>
                  <input
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                    placeholder="VD: Nguyễn Văn Anh"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Email <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                    placeholder="email@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Số điện thoại</label>
                  <input
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                    placeholder="0123 456 789"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Vai trò <span className="text-rose-500">*</span></label>
                  <select
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-800"
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  >
                    {Object.entries(roleLabel).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Mật khẩu <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Số CCCD</label>
                  <input
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                    placeholder="Số thẻ căn cước"
                    value={userForm.idCardNumber}
                    onChange={(e) => setUserForm({...userForm, idCardNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Địa chỉ thường trú</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                  placeholder="Địa chỉ ghi trên CCCD"
                  value={userForm.address}
                  onChange={(e) => setUserForm({...userForm, address: e.target.value})}
                />
              </div>

              {userForm.role === 'tenant' && (
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Gán phòng ngay (Tùy chọn)
                  </div>
                  <select 
                    className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold text-slate-800"
                    value={userForm.roomId}
                    onChange={(e) => setUserForm({...userForm, roomId: e.target.value})}
                  >
                    <option value="">-- Để trống nếu chưa gán --</option>
                    {rooms.map(r => (
                      <option key={r._id} value={r._id}>{r.name} ({r.price?.toLocaleString()}₫)</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {creatingUser ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : 'Tạo và Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex gap-2 items-start text-xs text-slate-500 italic">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                  <p>Sau khi gán, vai trò của người dùng sẽ tự động chuyển thành "Người thuê" (Tenant) và phòng sẽ chuyển sang trạng thái "Đã thuê" (Occupied).</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleAssign}
                  disabled={assigning || !selectedRoomId}
                  className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : 'Xác nhận gán'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
