import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from 'recharts'
import { ClipboardList, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { useSurveyStore } from '../store/surveyStore'
import { BUILDINGS, PRIORITY_OPTIONS } from '../types'

const COLORS = {
  urgent: '#ef4444',
  normal: '#f97316',
  low: '#22c55e',
}

function StatBox({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string
}) {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 'var(--space-4)' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10,22,40,0.95)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: '8px 14px',
        fontSize: 13,
        color: 'var(--text-primary)',
      }}>
        <p style={{ marginBottom: 4, color: 'var(--text-muted)', fontSize: 11 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.fill || p.stroke }}>
            {p.value} báo cáo
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { surveys } = useSurveyStore()

  const stats = useMemo(() => {
    const total = surveys.length
    const urgent = surveys.filter((s) => s.step4.priority === 'urgent').length
    const normal = surveys.filter((s) => s.step4.priority === 'normal').length
    const low = surveys.filter((s) => s.step4.priority === 'low').length
    const pending = surveys.filter((s) => s.syncStatus === 'pending').length
    const totalEquipment = surveys.reduce((sum, s) => sum + s.step3.brokenEquipment.length, 0)
    return { total, urgent, normal, low, pending, totalEquipment }
  }, [surveys])

  // Priority pie data
  const pieData = [
    { name: 'Khẩn cấp', value: stats.urgent, color: COLORS.urgent },
    { name: 'Bình thường', value: stats.normal, color: COLORS.normal },
    { name: 'Thấp', value: stats.low, color: COLORS.low },
  ].filter((d) => d.value > 0)

  // Building bar data
  const buildingData = BUILDINGS.map((b) => ({
    name: b.label.replace('Tòa ', ''),
    count: surveys.filter((s) => s.step1.building === b.value).length,
  })).filter((d) => d.count > 0)

  // Weekly trend (last 4 weeks)
  const weeklyData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (5 - i) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)
      const count = surveys.filter((s) => {
        const d = new Date(s.createdAt)
        return d >= weekStart && d < weekEnd
      }).length
      const label = `T${Math.ceil((weekStart.getDate()) / 7)}/${weekStart.getMonth() + 1}`
      return { name: label, count }
    })
  }, [surveys])

  // Top rooms with most issues
  const topRooms = useMemo(() => {
    return surveys
      .filter((s) => s.step3.brokenEquipment.length > 0)
      .sort((a, b) => b.step3.brokenEquipment.length - a.step3.brokenEquipment.length)
      .slice(0, 5)
  }, [surveys])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      <div>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 4 }}>Thống kê</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Tổng quan tình trạng cơ sở vật chất
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
        <StatBox label="Tổng báo cáo" value={stats.total} icon={ClipboardList} color="var(--color-primary)" />
        <StatBox label="Khẩn cấp" value={stats.urgent} icon={AlertTriangle} color="var(--color-danger)" />
        <StatBox label="Thiết bị hỏng" value={stats.totalEquipment} icon={Clock} color="var(--color-warning)" />
        <StatBox label="Chờ đồng bộ" value={stats.pending} icon={CheckCircle2} color="var(--color-info)" />
      </div>

      {/* Empty state */}
      {surveys.length === 0 && (
        <div className="glass-card">
          <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
            <div className="empty-state__icon">
              <ClipboardList size={28} color="var(--text-muted)" />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Chưa có dữ liệu thống kê
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                Thực hiện khảo sát để xem biểu đồ
              </p>
            </div>
          </div>
        </div>
      )}

      {surveys.length > 0 && (
        <>
          {/* Priority Pie Chart */}
          {pieData.length > 0 && (
            <div className="glass-card">
              <span className="section-title" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                Phân bố mức độ ưu tiên
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pieData.map((d) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--font-size-sm)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontWeight: 700, color: d.color }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Building Bar Chart */}
          {buildingData.length > 0 && (
            <div className="glass-card">
              <span className="section-title" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                Báo cáo theo tòa nhà
              </span>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={buildingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weekly trend */}
          <div className="glass-card">
            <span className="section-title" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
              Xu hướng báo cáo (6 tuần gần nhất)
            </span>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={weeklyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6, fill: '#7c3aed' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top rooms */}
          {topRooms.length > 0 && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <span className="section-title">Top phòng nhiều vấn đề nhất</span>
              {topRooms.map((s, i) => {
                const buildingLabel = BUILDINGS.find((b) => b.value === s.step1.building)?.label ?? s.step1.building
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: i === 0 ? 'rgba(251,191,36,0.2)' : 'var(--color-surface)',
                      border: `2px solid ${i === 0 ? '#fbbf24' : 'var(--color-border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800,
                      color: i === 0 ? '#fbbf24' : 'var(--text-muted)',
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        Phòng {s.step1.roomNumber}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {buildingLabel} — Tầng {s.step1.floor}
                      </div>
                    </div>
                    <span className="badge badge--danger">
                      {s.step3.brokenEquipment.length} thiết bị
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
