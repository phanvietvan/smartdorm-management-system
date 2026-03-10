import React from 'react'

export type CardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  accentClass?: string
}

export function Card({ title, value, subtitle, icon, accentClass = 'bg-gradient-to-r from-indigo-600 to-indigo-500' }: CardProps) {
  return (
    <div className="group relative rounded-2xl bg-white shadow-md ring-1 ring-slate-200 transition duration-200 ease-in-out hover:shadow-xl hover:ring-slate-300">
      {/* Border tuyến tính sáng tạo */}
      <div className={`absolute inset-0 rounded-2xl p-px opacity-0 transition duration-200 group-hover:opacity-100 ${accentClass} pointer-events-none`} />
      <div className="relative rounded-2xl bg-white p-6">
        <div className="flex items-start gap-4">
          {icon ? (
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-lg transition duration-200 ${accentClass} group-hover:scale-110`}>
              {icon}
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</div>
            <div className="mt-3 text-4xl font-bold text-slate-900 truncate">{value}</div>
            {subtitle ? <div className="mt-2 text-xs text-slate-600 leading-relaxed">{subtitle}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
