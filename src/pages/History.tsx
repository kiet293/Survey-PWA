import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ChevronRight, RefreshCw, AlertTriangle, ClipboardList } from 'lucide-react'
import { useSurveyStore } from '../store/surveyStore'
import { BUILDINGS, PRIORITY_OPTIONS } from '../types'
import type { Survey, Building, Priority } from '../types'
import { format } from '../utils/date'

function getPriorityBadgeClass(priority: string) {
  if (priority === 'urgent') return 'badge--danger'
  if (priority === 'normal') return 'badge--warning'
  return 'badge--success'
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { surveys } = useSurveyStore()

  const [search, setSearch] = useState('')
  const [filterBuilding, setFilterBuilding] = useState<Building | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  const filtered = surveys.filter((s) => {
    const matchSearch =
      !search ||
      s.step1.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.surveyorName.toLowerCase().includes(search.toLowerCase())
    const matchBuilding = filterBuilding === 'all' || s.step1.building === filterBuilding
    const matchPriority = filterPriority === 'all' || s.step4.priority === filterPriority
    return matchSearch && matchBuilding && matchPriority
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      <div>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 4 }}>Lịch sử báo cáo</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
          {surveys.length} báo cáo đã nộp
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
        <input
          id="history-search"
          type="search"
          className="form-input"
          placeholder="Tìm theo phòng hoặc tên người khảo sát..."
          style={{ paddingLeft: 40 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Building filter */}
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
            <button
              className={`pill ${filterBuilding === 'all' ? 'pill--active' : ''}`}
              onClick={() => setFilterBuilding('all')}
            >
              Tất cả tòa
            </button>
            {BUILDINGS.map((b) => (
              <button
                key={b.value}
                className={`pill ${filterBuilding === b.value ? 'pill--active' : ''}`}
                onClick={() => setFilterBuilding(b.value as Building)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority filter */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`pill ${filterPriority === 'all' ? 'pill--active' : ''}`}
            onClick={() => setFilterPriority('all')}
          >
            Mọi ưu tiên
          </button>
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p.value}
              className={`pill ${filterPriority === p.value ? 'pill--active' : ''}`}
              onClick={() => setFilterPriority(p.value as Priority)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(search || filterBuilding !== 'all' || filterPriority !== 'all') && (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Tìm thấy {filtered.length} kết quả
        </p>
      )}

      {/* Survey list */}
      {filtered.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state__icon">
              <ClipboardList size={28} color="var(--text-muted)" />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Không tìm thấy báo cáo
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                Thử thay đổi bộ lọc tìm kiếm
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filtered.map((survey) => {
            const buildingLabel = BUILDINGS.find((b) => b.value === survey.step1.building)?.label ?? survey.step1.building
            const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === survey.step4.priority)?.label ?? survey.step4.priority
            const badgeClass = getPriorityBadgeClass(survey.step4.priority)

            return (
              <div
                key={survey.id}
                className="glass-card survey-card animate-fade-in"
                onClick={() => navigate(`/survey/${survey.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                        Phòng {survey.step1.roomNumber}
                      </span>
                      <span className={`badge ${badgeClass}`}>{priorityLabel}</span>
                      {survey.syncStatus === 'pending' && (
                        <span className="badge badge--warning" style={{ gap: 3 }}>
                          <RefreshCw size={8} />Chờ sync
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 3 }}>
                      {buildingLabel} — Tầng {survey.step1.floor}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {format(new Date(survey.createdAt))} · {survey.surveyorName}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" style={{ marginTop: 4, flexShrink: 0 }} />
                </div>

                {/* Facility conditions row */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Đ.hòa', val: survey.step2.airConditioner },
                    { label: 'Chiếu', val: survey.step2.projector },
                    { label: 'Bảng', val: survey.step2.whiteboard },
                  ].map((item) => (
                    <span
                      key={item.label}
                      className={`status-chip status-chip--${item.val === 'good' ? 'good' : item.val === 'needs_repair' ? 'repair' : 'broken'}`}
                      style={{ fontSize: 10, padding: '2px 8px' }}
                    >
                      {item.label}
                    </span>
                  ))}
                  {survey.step3.brokenEquipment.length > 0 && (
                    <span className="status-chip status-chip--broken" style={{ fontSize: 10, padding: '2px 8px', gap: 3 }}>
                      <AlertTriangle size={9} />
                      {survey.step3.brokenEquipment.length} thiết bị hỏng
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
