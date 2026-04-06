import type { Notification } from '../api/notifications'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { notificationsApi } from '../api/notifications'
import { useAuth } from '../context/AuthContext'

/** Relative time formatter */
export function getRelativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHour < 24) return `${diffHour} giờ trước`
  if (diffDay === 1) return 'Hôm qua'
  if (diffDay < 7) return `${diffDay} ngày trước`
  return d.toLocaleDateString('vi-VN')
}

const typeConfig: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  bill: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ),
    bg: 'bg-emerald-100',
    color: 'text-emerald-600'
  },
  maintenance: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    ),
    bg: 'bg-amber-100',
    color: 'text-amber-600'
  },
  payment: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ),
    bg: 'bg-indigo-100',
    color: 'text-indigo-600'
  },
  system: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    ),
    bg: 'bg-slate-100',
    color: 'text-slate-600'
  },
  general: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
    ),
    bg: 'bg-blue-100',
    color: 'text-blue-600'
  }
}

type NotificationItemProps = {
  note: Notification
  onMarkRead: (id: string) => void
  compact?: boolean
  index?: number
}

const EMOJIS = ['👍', '❤️', '👏', '🔥']

export default function NotificationItem({ note, onMarkRead, compact, index = 1 }: NotificationItemProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reactions, setReactions] = useState(note.reactions || [])
  const cfg = typeConfig[note.type] || typeConfig.general
  
  const actorAvatar = note.actor?.avatarUrl || (note.actor?.fullName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(note.actor.fullName)}&background=6366f1&color=fff` : null)

  const handleToggleReaction = async (emoji: string) => {
    try {
      const res = await notificationsApi.toggleReaction(note._id, emoji)
      if (res.data?.data) {
        setReactions(res.data.data)
      }
    } catch (err) {
      console.error('Toggle reaction failed')
    }
  }

  const handleClick = () => {
    if (!note.isRead) onMarkRead(note._id)
    if (note.link) navigate(note.link)
  }

  const content = (
    <div className="flex gap-3 flex-1 min-w-0">
      <div className="flex-shrink-0">
        {actorAvatar ? (
          <img src={actorAvatar} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-white shadow-md" />
        ) : (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-black/5 ${cfg.bg} ${cfg.color}`}>
            {cfg.icon}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-slate-900 leading-snug whitespace-nowrap overflow-hidden text-ellipsis ${compact ? 'text-xs' : 'text-sm'}`}>{note.title}</p>
        <p className={`text-slate-600 mt-0.5 line-clamp-2 ${compact ? 'text-[11px]' : 'text-sm'}`}>{note.message}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className={`${cfg.color} font-black uppercase tracking-widest`}>{note.type}</span>
            <span>·</span>
            <span>{getRelativeTime(note.createdAt)}</span>
          </p>
          
          {/* Reaction counts */}
          {reactions.length > 0 && (
            <div className="flex -space-x-1 items-center bg-slate-50 px-1.5 py-0.5 rounded-full border border-slate-100">
               {Array.from(new Set(reactions.map(r => r.emoji))).slice(0, 3).map(e => (
                 <span key={e} className="text-[10px]">{e}</span>
               ))}
               <span className="ml-1 text-[9px] font-bold text-slate-500">{reactions.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div 
      className={`group relative flex items-start gap-4 p-5 cursor-pointer transition-all duration-300 ${
        !note.isRead ? 'bg-indigo-50/50 border-l-4 border-l-primary' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
      }`}
      onClick={handleClick}
    >
      {content}
      
      {/* Action panel (Emoji + Mark as read) */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
         {/* Emoji Panel */}
         <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-2 py-1 shadow-sm">
            {EMOJIS.map(e => {
                const isSelected = reactions.some(r => r.userId === user?._id && r.emoji === e)
                return (
                  <button 
                    key={e} 
                    className={`hover:scale-125 transition-transform text-sm ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                    onClick={(ev) => { ev.stopPropagation(); handleToggleReaction(e); }}
                  >
                    {e}
                  </button>
                )
            })}
         </div>

         {!note.isRead && (
           <button 
            onClick={(e) => { e.stopPropagation(); onMarkRead(note._id); }}
            className="p-2 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 transition-all font-bold"
           >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
           </button>
         )}
      </div>
    </div>
  )
}
