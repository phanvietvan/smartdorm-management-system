import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useSocket = () => {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user?._id) return

    // Initialize socket
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setIsConnected(true)
      // Join user specific room
      socket.emit('join', user._id)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user?._id])

  return {
    socket: socketRef.current,
    isConnected
  }
}
