import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type ChartDataPoint = { label: string; value: number }

export type ChartProps = {
  title: string
  subtitle?: string
  data: ChartDataPoint[]
  type?: 'line' | 'bar'
  color?: string
}

export function Chart({ title, subtitle, data, type = 'line', color = '#4f46e5' }: ChartProps) {
  const sharedProps = {
    data,
    margin: { top: 0, right: 12, bottom: 0, left: 0 },
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title">{title}</div>
        {subtitle ? <div className="chart-card-subtitle">{subtitle}</div> : null}
      </div>
      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart {...sharedProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)' }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart {...sharedProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)' }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
