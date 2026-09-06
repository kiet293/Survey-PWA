import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardCheck, AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react'
import { useSurveyStore } from '../store/surveyStore'
import { useAuthStore } from '../store/authStore'
import { BUILDINGS, PRIORITY_OPTIONS } from '../types'
import type { Survey } from '../types'
import { format } from '../utils/date'

function getPriorityBadgeClass(priority: string) {
  if (priority === 'urgent') return 'badge--danger'
  if (priority === 'normal') return 'badge--warning'
  return 'badge--success'
}

function getPriorityLabel(priority: string) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? priority
}

function getBuildingLabel(building: string) {
  return BUILDINGS.find((b) => b.value === building)?.label ?? building
}

function StatCard({ value, label, icon: Icon, color }: {
  value: number | string; label: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="glass-card stat-card" style={{ flex: 1, minWidth: 0 }}>
      <div className="stat-card__icon" style={{ background: `${color}18` }}>
        <Icon size={20} color={color} />
      </div>
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}

function SurveyCard({ survey }: { survey: Survey }) {
  const navigate = useNavigate()
  const building = getBuildingLabel(survey.step1.building)
  const priority = getPriorityLabel(survey.step4.priority)
  const badgeClass = getPriorityBadgeClass(survey.step4.priority)

  return (
    <div
      className="glass-card survey-card animate-fade-in"
      onClick={() => navigate(`/survey/${survey.id}`)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
              Phòng {survey.step1.roomNumber}
            </span>
            <span className={`badge ${badgeClass}`}>{priority}</span>
            {survey.syncStatus === 'pending' && (
              <span className="badge badge--warning" style={{ gap: 3 }}>
                <RefreshCw size={8} />Chờ sync
              </span>
            )}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 4 }}>
            {building} — Tầng {survey.step1.floor}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {format(new Date(survey.createdAt))} · {survey.surveyorName}
          </div>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" style={{ marginTop: 4, flexShrink: 0 }} />
      </div>

      {/* Equipment issues count */}
      {survey.step3.brokenEquipment.length > 0 && (
        <div style={{
          marginTop: 10,
          padding: '6px 10px',
          background: 'var(--color-danger-bg)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-danger)',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <AlertTriangle size={11} />
          {survey.step3.brokenEquipment.length} thiết bị cần sửa
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { surveys, pendingCount } = useSurveyStore()
  const { user } = useAuthStore()

  const recentSurveys = surveys.slice(0, 5)
  const urgentCount = surveys.filter((s) => s.step4.priority === 'urgent').length
  const totalEquipmentIssues = surveys.reduce((sum, s) => sum + s.step3.brokenEquipment.length, 0)

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Greeting */}
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>
          Xin chào 👋
        </p>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
          {user?.name ?? 'Người dùng'}
        </h1>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <StatCard
          value={surveys.length}
          label="Tổng báo cáo"
          icon={ClipboardCheck}
          color="var(--color-primary)"
        />
        <StatCard
          value={urgentCount}
          label="Khẩn cấp"
          icon={AlertTriangle}
          color="var(--color-danger)"
        />
        <StatCard
          value={pendingCount}
          label="Chờ sync"
          icon={RefreshCw}
          color="var(--color-warning)"
        />
      </div>

      {/* CTA Button */}
      <button
        id="home-new-survey-btn"
        className="btn btn--primary btn--full btn--lg"
        onClick={() => navigate('/survey')}
        style={{
          background: 'var(--gradient-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '18px',
          fontSize: 'var(--font-size-md)',
          boxShadow: '0 6px 32px rgba(37,99,235,0.35)',
        }}
      >
        <Plus size={22} />
        Bắt đầu khảo sát mới
      </button>

      {/* Equipment issues quick stats */}
      {totalEquipmentIssues > 0 && (
        <div
          className="glass-card"
          style={{
            padding: 'var(--space-4)',
            borderColor: 'rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--color-danger-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={18} color="var(--color-danger)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
                {totalEquipmentIssues} thiết bị cần chú ý
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Trên tổng số {surveys.length} báo cáo
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent surveys */}
      <div>
        <div className="section-header">
          <span className="section-title">Báo cáo gần đây</span>
          {surveys.length > 5 && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => navigate('/history')}
              style={{ fontSize: 'var(--font-size-xs)', gap: 4 }}
            >
              Xem tất cả <ChevronRight size={12} />
            </button>
          )}
        </div>

        {recentSurveys.length === 0 ? (
          <div className="glass-card">
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="empty-state__icon">
                <ClipboardCheck size={28} color="var(--text-muted)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Chưa có báo cáo nào
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                  Bắt đầu khảo sát phòng học đầu tiên!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {recentSurveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
