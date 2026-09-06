import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Trash2, RefreshCw, Camera } from 'lucide-react'
import { getSurveyById, deleteSurvey } from '../db/db'
import { useSurveyStore } from '../store/surveyStore'
import { BUILDINGS, PRIORITY_OPTIONS, ROOM_TYPES } from '../types'
import type { Survey } from '../types'
import { format } from '../utils/date'

const conditionLabels: Record<string, { label: string; cls: string }> = {
  good:         { label: 'Tốt',          cls: 'success' },
  needs_repair: { label: 'Cần sửa',      cls: 'warning' },
  broken:       { label: 'Hỏng',         cls: 'danger'  },
}

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loadSurveys } = useSurveyStore()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getSurveyById(id).then((s) => {
        setSurvey(s ?? null)
        setLoading(false)
      })
    }
  }, [id])

  const handleDelete = async () => {
    if (!survey) return
    if (!confirm(`Xóa báo cáo phòng ${survey.step1.roomNumber}? Thao tác này không thể hoàn tác.`)) return
    await deleteSurvey(survey.id)
    await loadSurveys()
    navigate('/history')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />
        ))}
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="glass-card">
        <div className="empty-state">
          <p>Không tìm thấy báo cáo này</p>
          <button className="btn btn--secondary" onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      </div>
    )
  }

  const building = BUILDINGS.find((b) => b.value === survey.step1.building)
  const roomType = ROOM_TYPES.find((r) => r.value === survey.step2.roomType)
  const priority = PRIORITY_OPTIONS.find((p) => p.value === survey.step4.priority)

  const facilities = [
    { label: 'Điều hòa',      value: survey.step2.airConditioner },
    { label: 'Máy chiếu',     value: survey.step2.projector },
    { label: 'Bảng viết',     value: survey.step2.whiteboard },
    { label: 'Đèn chiếu sáng', value: survey.step2.lighting },
    { label: 'Cửa / Cửa sổ', value: survey.step2.doors },
  ]

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn--ghost btn--icon" onClick={() => navigate(-1)} style={{ width: 38, height: 38 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, lineHeight: 1.2 }}>
              Phòng {survey.step1.roomNumber}
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              {building?.label} — Tầng {survey.step1.floor}
            </p>
          </div>
          <button
            className="btn btn--danger btn--icon"
            onClick={handleDelete}
            style={{ width: 38, height: 38 }}
            title="Xóa báo cáo"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Meta info */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Ngày khảo sát</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                {format(new Date(survey.createdAt))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Người khảo sát</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{survey.surveyorName}</div>
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: `${priority?.color ?? '#fff'}18`,
                border: `1px solid ${priority?.color ?? '#fff'}40`,
                color: priority?.color,
                fontSize: 'var(--font-size-sm)',
                fontWeight: 700,
              }}
            >
              {priority?.label} — {priority?.subtitle}
            </span>
            {survey.syncStatus === 'pending' && (
              <span className="badge badge--warning" style={{ gap: 4 }}>
                <RefreshCw size={10} /> Chờ đồng bộ
              </span>
            )}
            {survey.syncStatus === 'synced' && (
              <span className="badge badge--success">✓ Đã đồng bộ</span>
            )}
          </div>
        </div>

        {/* Room Info */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="section-title">Thông tin phòng</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 3 }}>Loại phòng</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{roomType?.label}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 3 }}>Sức chứa</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{survey.step2.capacity} chỗ ngồi</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>Đánh giá tổng thể</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map((star) => (
                <span key={star} style={{ fontSize: 20, color: star <= survey.step2.overallRating ? '#fbbf24' : 'var(--color-border-2)' }}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Facility conditions */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="section-title">Tình trạng thiết bị</span>
          {facilities.map((fac) => {
            const cond = conditionLabels[fac.value] ?? { label: fac.value, cls: 'muted' }
            return (
              <div key={fac.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 10,
                borderBottom: '1px solid var(--color-border)',
              }}>
                <span style={{ fontSize: 'var(--font-size-sm)' }}>{fac.label}</span>
                <span className={`badge badge--${cond.cls}`}>{cond.label}</span>
              </div>
            )
          })}
        </div>

        {/* Room photos */}
        {(survey.step2.photos?.length ?? 0) > 0 && (
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Camera size={14} color="var(--text-muted)" />
              <span className="section-title">Ảnh phòng học</span>
            </div>
            <div className="photo-grid">
              {survey.step2.photos!.map((src, i) => (
                <div
                  key={i}
                  className="photo-thumb"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPhoto(src)}
                >
                  <img src={src} alt={`Ảnh phòng ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broken equipment */}
        {survey.step3.brokenEquipment.length > 0 && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="section-title">Thiết bị hỏng ({survey.step3.brokenEquipment.length})</span>
            {survey.step3.brokenEquipment.map((eq) => (
              <div
                key={eq.id}
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${eq.severity === 'broken' ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: eq.severity === 'broken' ? 'var(--color-danger)' : 'var(--color-warning)',
                  }} />
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{eq.name}</span>
                  <span className={`badge ${eq.severity === 'broken' ? 'badge--danger' : 'badge--warning'}`}>
                    {eq.severity === 'broken' ? 'Hỏng nặng' : 'Cần bảo trì'}
                  </span>
                </div>
                {eq.description && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: 16 }}>
                    {eq.description}
                  </p>
                )}
                {(eq.photos?.length ?? 0) > 0 && (
                  <div className="photo-grid" style={{ marginTop: 8, gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {eq.photos!.map((src, pi) => (
                      <div key={pi} className="photo-thumb" style={{ cursor: 'pointer' }} onClick={() => setSelectedPhoto(src)}>
                        <img src={src} alt="" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {survey.step4.additionalNotes && (
          <div className="glass-card">
            <span className="section-title" style={{ display: 'block', marginBottom: 8 }}>Ghi chú</span>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {survey.step4.additionalNotes}
            </p>
          </div>
        )}
      </div>

      {/* Photo lightbox */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Xem ảnh"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  )
}
