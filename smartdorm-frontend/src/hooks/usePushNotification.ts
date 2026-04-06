import { useEffect } from 'react'
import { notificationsApi } from '../api/notifications'
import { useAuth } from '../context/AuthContext'

const VAPID_PUBLIC_KEY = 'BGAluCQgjrFnguDMvFHDNNewtBEQqEJCV6_aJdkjGpe99gblfEkuBCfyS6aRtbzqRkU2Jm_FnziXMpSmkWhuBak'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const usePushNotification = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?._id) return

    const registerPush = async () => {
      try {
        if (!('serviceWorker' in navigator)) return
        if (!('PushManager' in window)) return

        // Wait for service worker registration
        const registration = await navigator.serviceWorker.ready
        
        // Request notification permission
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('Push notification permission denied')
          return
        }

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        })

        // Send to backend
        await notificationsApi.subscribePush(subscription)
        console.log('Push notification registered successfully')
      } catch (error) {
        console.error('Failed to register push:', error)
      }
    }

    registerPush()
  }, [user?._id])

  return null
}
