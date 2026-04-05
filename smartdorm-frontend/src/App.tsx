import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import Bills from './pages/Bills'
import BillDetail from './pages/BillDetail'
import Maintenance from './pages/Maintenance'
import MaintenanceDetail from './pages/MaintenanceDetail'
import Users from './pages/Users'
import Login from './pages/Login'
import Register from './pages/Register'
import ProfileSettings from './pages/ProfileSettings'
import Notifications from './pages/Notifications'
import Messages from './pages/Messages'
import Areas from './pages/Areas'
import Services from './pages/Services'
import Visitors from './pages/Visitors'
import Payments from './pages/Payments'
import PendingApproval from './pages/PendingApproval'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

import RoomsAvailable from './pages/RoomsAvailable'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/rooms-available" element={<RoomsAvailable />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:id" element={<RoomDetail />} />
        <Route path="bills" element={<Bills />} />
        <Route path="bills/:id" element={<BillDetail />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="maintenance/:id" element={<MaintenanceDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="messages" element={<Messages />} />
        <Route path="areas" element={<Areas />} />
        <Route path="services" element={<Services />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="payments" element={<Payments />} />
        <Route path="pending" element={<PendingApproval />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
