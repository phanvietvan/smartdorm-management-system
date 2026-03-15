import type { Notification } from '../api/notifications'

/** Thời gian tương đối như Facebook: "2 phút trước", "Hôm qua"... */
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

/** Icon và màu theo loại thông báo */
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
  contract: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    ),
    bg: 'bg-violet-100',
    color: 'text-violet-600'
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

export function getTypeConfig(type: string) {
  return typeConfig[type] || typeConfig.general
}

type NotificationItemProps = {
  note: Notification
  onMarkRead?: (id: string) => void
  compact?: boolean
  onClick?: () => void
  index?: number
}

/** Component thông báo theo style Facebook: avatar/icon trái, nội dung phải, trạng thái đọc rõ ràng */
export default function NotificationItem({ note, onMarkRead, compact, onClick, index = 0 }: NotificationItemProps) {
  const cfg = getTypeConfig(note.type)
  const avatarUrl = note.userId?.fullName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(note.userId.fullName)}&background=6366f1&color=fff`
    : null

  const content = (
    <div className="flex gap-3 flex-1 min-w-0">
      {/* Avatar hoặc Icon loại thông báo - hover scale */}
      <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-white/80 shadow-md" />
        ) : (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-black/5 ${cfg.bg} ${cfg.color}`}>
            {cfg.icon}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className={`font-semibold text-slate-900 leading-snug truncate ${compact ? 'text-sm' : 'text-sm sm:text-base'}`}>{note.title}</p>
        <p className="text-sm text-slate-600 mt-0.5 line-clamp-2 break-words">{note.content}</p>
        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
          <span className={`${cfg.color} font-medium uppercase tracking-wide`}>{note.type}</span>
          <span>·</span>
          <span>{getRelativeTime(note.createdAt)}</span>
        </p>
      </div>
      {!note.isRead && compact && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-2 shadow-[0_0_0_2px_rgba(99,102,241,0.4)]" />
      )}
    </div>
  )

  const baseClasses = `flex items-start gap-3 p-4 cursor-pointer transition-all duration-300 ease-out group relative min-w-0 overflow-hidden ${
    !note.isRead
      ? 'bg-indigo-50/70 hover:bg-indigo-50 border-l-[3px] border-l-indigo-500 hover:border-l-indigo-600'
      : 'bg-white/80 hover:bg-white border-l-[3px] border-l-transparent hover:border-l-slate-200'
  }`

  const animStyle = !compact ? { animationDelay: `${Math.min(index * 50, 500)}ms`, opacity: 0 } as React.CSSProperties : undefined
  const animClass = !compact ? 'notif-item-enter' : ''

  const fullContent = compact ? (
    <div className={baseClasses} onClick={onClick}>
      {content}
      {onMarkRead && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkRead(note._id); }}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200"
          title="Đánh dấu đã đọc"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </button>
      )}
    </div>
  ) : (
    <div
      className={`${baseClasses} rounded-xl ${animClass}`}
      style={animStyle}
      onClick={() => { if (!note.isRead) onMarkRead?.(note._id); onClick?.(); }}
    >
      {content}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!note.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.4)]" />}
        {onMarkRead && !note.isRead && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkRead(note._id); }}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-all duration-200"
        >
            Đánh dấu đã đọc
          </button>
        )}
      </div>
    </div>
  )

  return fullContent
}
