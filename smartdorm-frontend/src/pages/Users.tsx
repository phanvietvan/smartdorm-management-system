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
    <div className="space-y-6 pb-20">
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
                            <div className="flex gap-2">
                              {isGuest && (
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                                  onClick={() => handleOpenAssignModal(u)}
                                >
                                  Gán phòng
                                </button>
                              )}
                              {u.role === 'tenant' && u.roomId && (
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-600 hover:text-white transition-all"
                                  disabled={updatingId === u._id}
                                  onClick={() => handleUnassign(u)}
                                >
                                  Thu hồi
                                </button>
                              )}
                              {u.role === 'tenant' && (
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                                  onClick={() => handleOpenHistory(u)}
                                >
                                  Lịch sử
                                </button>
                              )}
                            </div>
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
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-all">
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  <option value="">-- Chọn một phòng --</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.price?.toLocaleString()}₫)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl">Hủy</button>
                <button onClick={handleAssign} disabled={assigning || !selectedRoomId} className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 disabled:opacity-50">
                  {assigning ? 'Đang gán...' : 'Xác nhận gán'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Thêm người dùng mới</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Họ và tên *</label>
                  <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" value={userForm.fullName} onChange={(e) => setUserForm({...userForm, fullName: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Email *</label>
                  <input required type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Vai trò *</label>
                  <select required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800" value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                    {Object.entries(roleLabel).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Mật khẩu *</label>
                  <input required type="password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl">Hủy</button>
                <button type="submit" disabled={creatingUser} className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50">
                  {creatingUser ? 'Đang tạo...' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resident History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-50 rounded-[2rem] shadow-2xl w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-100">
                  {selectedUser?.fullName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Hồ sơ cư dân: {selectedUser?.fullName}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Lịch sử hoạt động & Tương tác hệ thống</p>
                </div>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-8">
              {historyLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang trích xuất dữ liệu...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Maintenance Column */}
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                      <span className="material-symbols-outlined text-sm">build</span>
                      Sửa chữa ({userActivity.maintenance.length})
                    </h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {userActivity.maintenance.map(m => (
                        <div key={m._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="font-bold text-slate-800 text-sm leading-tight">{m.title}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-[10px] font-bold text-slate-400">{new Date(m.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${m.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {userActivity.maintenance.length === 0 && <p className="text-[10px] font-bold text-slate-300 uppercase py-4 text-center">Trống</p>}
                    </div>
                  </div>

                  {/* Bills Column */}
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                      <span className="material-symbols-outlined text-sm">receipt_long</span>
                      Hóa đơn ({userActivity.bills.length})
                    </h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {userActivity.bills.map(b => (
                        <div key={b._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">Kì: {b.month}/{b.year}</p>
                              <p className="text-indigo-600 font-black text-[11px] mt-1">{b.totalAmount?.toLocaleString()}₫</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${b.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {userActivity.bills.length === 0 && <p className="text-[10px] font-bold text-slate-300 uppercase py-4 text-center">Trống</p>}
                    </div>
                  </div>

                  {/* Visitors Column */}
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Khách ({userActivity.visitors.length})
                    </h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {userActivity.visitors.map(v => (
                        <div key={v._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                             <p className="font-black text-slate-800 text-sm">{v.name}</p>
                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${v.status === 'allowed' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                               {v.status}
                             </span>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 pt-1">
                             <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="material-symbols-outlined text-[14px]">call</span>
                                <span className="font-bold">{v.phone || 'N/A'}</span>
                             </div>
                             <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="material-symbols-outlined text-[14px]">badge</span>
                                <span className="font-bold">CCCD: {v.idCard || 'N/A'}</span>
                             </div>
                             {v.plateNumber && (
                               <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <span className="material-symbols-outlined text-[14px]">directions_car</span>
                                  <span className="font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{v.plateNumber}</span>
                               </div>
                             )}
                          </div>

                          <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic bg-indigo-50/30 p-2 rounded-xl border border-dashed border-indigo-100">
                            "{v.purpose || 'Không có lý do'}"
                          </p>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400">{new Date(v.checkInAt).toLocaleDateString('vi-VN')}</span>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Chi tiết</span>
                          </div>
                        </div>
                      ))}
                      {userActivity.visitors.length === 0 && <p className="text-[10px] font-bold text-slate-300 uppercase py-4 text-center">Trống</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white px-8 py-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-8 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
