import { useEffect, useState } from 'react'
import { usersApi, type User } from '../api/users'
import { roomsApi, type Room } from '../api/rooms'
import { notificationsApi } from '../api/notifications'
import { maintenanceApi } from '../api/maintenance'
import { billsApi } from '../api/bills'
import { visitorsApi } from '../api/visitors'
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

  // History Modal states
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [userActivity, setUserActivity] = useState<{
    maintenance: any[],
    bills: any[],
    visitors: any[]
  }>({ maintenance: [], bills: [], visitors: [] })

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

  const handleUnassign = async (u: User) => {
    if (!window.confirm(`Bạn có chắc muốn thu hồi phòng của ${u.fullName}? Vai trò sẽ chuyển về Khách.`)) return
    setUpdatingId(u._id)
    try {
      await usersApi.unassignTenant({ userId: u._id })
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi thu hồi phòng')
    } finally {
      setUpdatingId(null)
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

  const handleOpenHistory = async (u: User) => {
    setSelectedUser(u)
    setIsHistoryModalOpen(true)
    setHistoryLoading(true)
    try {
      const [mRes, bRes, vRes] = await Promise.all([
        maintenanceApi.getAll({ tenantId: u._id }),
        billsApi.getAll({ tenantId: u._id }),
        visitorsApi.getAll({ tenantId: u._id })
      ])
      setUserActivity({
        maintenance: mRes.data,
        bills: bRes.data,
        visitors: vRes.data
      })
    } catch {
      alert('Không thể tải lịch sử hoạt động')
    } finally {
      setHistoryLoading(false)
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
    <div className="space-y-8 pb-20 font-sans text-slate-900">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Quản lý người dùng</h2>
          <p className="text-slate-500 mt-1 font-medium">
            Tổng số người dùng hệ thống: <span className="font-bold text-indigo-600">{users.length}</span>
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            Thêm người dùng
          </button>
        )}
      </div>

      {/* Stats Cards - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-indigo-500 transition-all duration-300">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tổng người dùng</p>
          <h3 className="text-2xl font-black mt-1 text-slate-800">{users.length}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-emerald-500 transition-all duration-300">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <span className="material-symbols-outlined">person_check</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cư dân đang ở</p>
          <h3 className="text-2xl font-black mt-1 text-slate-800">{users.filter(u => u.role === 'tenant').length}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-amber-500 transition-all duration-300">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Chờ phê duyệt</p>
          <h3 className="text-2xl font-black mt-1 text-slate-800">{users.filter(u => (u as any).status === 'pending').length}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-purple-500 transition-all duration-300">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
            <span className="material-symbols-outlined">hail</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Số lượng khách</p>
          <h3 className="text-2xl font-black mt-1 text-slate-800">{users.filter(u => u.role === 'guest').length}</h3>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Người dùng</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Vai trò</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Phòng</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Trạng thái</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {users.map((u) => {
                const isGuest = u.role === 'guest'
                const isPending = (u as any).status === 'pending'
                const initials = u.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

                return (
                  <tr key={u._id} className="hover:bg-slate-50/40 transition-all duration-200 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm border border-white ${
                          u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                          u.role === 'tenant' ? 'bg-purple-100 text-purple-700' : 
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{u.fullName}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                        u.role === 'tenant' ? 'bg-purple-50 text-purple-600' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {roleLabel[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {u.roomId ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                          <span className="text-sm font-black text-indigo-600">
                             {typeof u.roomId === 'object' ? (u.roomId as any).name : u.roomId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-300 italic">Chưa gán</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isPending ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                          {isPending ? 'Chờ phê duyệt' : 'Đã duyệt'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 outline-none">
                        {canManage && (
                          <div className="flex gap-2">
                            {isPending ? (
                              <>
                                <button
                                  disabled={updatingId === u._id}
                                  onClick={() => handleApprove(u)}
                                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
                                >
                                  Duyệt
                                </button>
                                <button
                                  disabled={updatingId === u._id}
                                  onClick={() => handleReject(u)}
                                  className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50"
                                >
                                  Bỏ
                                </button>
                              </>
                            ) : (
                              <>
                                {isGuest && (
                                  <button
                                    onClick={() => handleOpenAssignModal(u)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <span className="material-symbols-outlined text-sm">door_open</span>
                                    Gán phòng
                                  </button>
                                )}
                                {u.role === 'tenant' && u.roomId && (
                                  <button
                                    disabled={updatingId === u._id}
                                    onClick={() => handleUnassign(u)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                  >
                                    <span className="material-symbols-outlined text-sm">block</span>
                                    Thu hồi
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenHistory(u)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-sm">history</span>
                                  Lịch sử
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Hiển thị {users.length} người dùng</p>
          <div className="flex gap-2">
            <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-100 italic">1</button>
            <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals - Keeping existing logic but restyling containers */}
      {/* Assign Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Gán phòng mới</h3>
                 <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Tiến trình xét duyệt cư dân</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">
                  {selectedUser?.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Đối tượng gán</p>
                  <div className="font-black text-slate-800">{selectedUser?.fullName}</div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh sách phòng trống</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none appearance-none"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  <option value="">-- Chọn một phòng --</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>{r.name} - {r.price?.toLocaleString()}₫ / tháng</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">Hủy bỏ</button>
                <button 
                  onClick={handleAssign} 
                  disabled={assigning || !selectedRoomId} 
                  className="flex-1 py-4 text-xs font-black text-white bg-indigo-600 uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
                >
                  {assigning ? 'Đang lý...' : 'Xác nhận gán'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Đăng ký người dùng</h3>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Khởi tạo dữ liệu cư dân mới</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên *</label>
                  <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 outline-none" value={userForm.fullName} onChange={(e) => setUserForm({...userForm, fullName: e.target.value})} placeholder="Nhập tên đầy đủ..." />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email liên hệ *</label>
                  <input required type="email" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 outline-none" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} placeholder="example@gmail.com" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò hệ thống *</label>
                  <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 outline-none appearance-none" value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                    {Object.entries(roleLabel).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu khởi tạo *</label>
                  <input required type="password" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 outline-none" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} placeholder="••••••••" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">Đóng</button>
                <button type="submit" disabled={creatingUser} className="flex-1 py-4 text-xs font-black text-white bg-indigo-600 uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95">
                  {creatingUser ? 'Đang khởi tạo...' : 'Tạo người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal remains similar but with Bento styling applied via existing code in original file */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-50 rounded-[2.5rem] shadow-2xl w-full max-w-5xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white px-8 py-7 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-100 border-2 border-white">
                  {selectedUser?.fullName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Hồ sơ: {selectedUser?.fullName}</h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Lịch sử tương tác & Dữ liệu lưu trú</p>
                </div>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-all"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            
            <div className="p-10">
              {historyLoading ? (
                <div className="py-24 flex flex-col items-center gap-5">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Trích xuất cơ sở dữ liệu...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Maintenance Column */}
                  <div className="space-y-8">
                    <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">
                       <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                       Sửa chữa ({userActivity.maintenance.length})
                    </h4>
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-3 no-scrollbar">
                      {userActivity.maintenance.map(m => (
                        <div key={m._id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{m.title}</p>
                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
                            <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(m.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${m.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {userActivity.maintenance.length === 0 && (
                        <div className="h-32 rounded-[1.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2">
                           <span className="material-symbols-outlined text-slate-200">contract_edit</span>
                           <p className="text-[9px] font-black text-slate-300 uppercase">Không có dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bills Column */}
                  <div className="space-y-8">
                    <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">
                       <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                       Tài chính ({userActivity.bills.length})
                    </h4>
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-3 no-scrollbar">
                      {userActivity.bills.map(b => (
                        <div key={b._id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kỳ hóa đơn</p>
                              <p className="font-black text-slate-800 text-base italic">{b.month}/{b.year}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${b.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {b.status === 'paid' ? 'Đã thanh toán' : 'Chưa đóng'}
                            </span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-50">
                             <p className="text-indigo-600 font-black text-lg tracking-tighter">{b.totalAmount?.toLocaleString()} <span className="text-xs uppercase ml-0.5">Vnd</span></p>
                          </div>
                        </div>
                      ))}
                      {userActivity.bills.length === 0 && (
                        <div className="h-32 rounded-[1.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2">
                           <span className="material-symbols-outlined text-slate-200">payments</span>
                           <p className="text-[9px] font-black text-slate-300 uppercase">Không có dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visitors Column */}
                  <div className="space-y-8">
                    <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">
                       <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                       Lịch khách ({userActivity.visitors.length})
                    </h4>
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-3 no-scrollbar">
                      {userActivity.visitors.map(v => (
                        <div key={v._id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="font-black text-slate-800 text-sm tracking-tight">{v.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Khách thăm thân</p>
                             </div>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${v.status === 'allowed' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                               {v.status === 'allowed' ? 'Hợp lệ' : 'Hết hạn'}
                             </span>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                <span className="material-symbols-outlined text-base">call</span>
                                <span className="font-black tracking-tight">{v.phone}</span>
                             </div>
                             <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                <span className="material-symbols-outlined text-base">badge</span>
                                <span className="font-black tracking-tight">CCCD: {v.idCard}</span>
                             </div>
                             {v.plateNumber && (
                               <div className="flex items-center gap-3 text-[10px] text-indigo-600 font-black">
                                  <span className="material-symbols-outlined text-base">directions_car</span>
                                  <span className="bg-indigo-100/50 px-2 py-0.5 rounded-lg border border-indigo-200/50">{v.plateNumber}</span>
                               </div>
                             )}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(v.checkInAt).toLocaleDateString('vi-VN')}</span>
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                               <span className="material-symbols-outlined text-sm">visibility</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {userActivity.visitors.length === 0 && (
                        <div className="h-32 rounded-[1.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2">
                           <span className="material-symbols-outlined text-slate-200">account_circle</span>
                           <p className="text-[9px] font-black text-slate-300 uppercase">Không có dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white px-10 py-8 border-t border-slate-50 flex justify-end">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Đóng hồ sơ cư dân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

}
