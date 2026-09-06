import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, Send, AlertTriangle, Check } from 'lucide-react'
import { PRIORITY_OPTIONS, BUILDINGS, ROOM_TYPES } from '../../types'
import type { SurveyStep1, SurveyStep2, SurveyStep3, SurveyStep4, Priority } from '../../types'

const schema = z.object({
  priority: z.enum(['urgent', 'normal', 'low']),
  estimatedRepairTime: z.string().optional(),
  additionalNotes: z.string().max(500, 'Tối đa 500 ký tự').optional(),
})

type FormData = z.infer<typeof schema>

interface Step4PriorityProps {
  step1: SurveyStep1
  step2: SurveyStep2
  step3: SurveyStep3
  onSubmit: (data: SurveyStep4) => void
  onBack: () => void
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 10,
      borderBottom: '1px solid var(--color-border)',
      gap: 12,
    }}>
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function Step4Priority({ step1, step2, step3, onSubmit, onBack }: Step4PriorityProps) {
  const [selectedPriority, setSelectedPriority] = useState<Priority>('normal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noteCount, setNoteCount] = useState(0)

  const { register, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: { priority: 'normal', estimatedRepairTime: '', additionalNotes: '' },
  })

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    await onSubmit({ ...data, priority: selectedPriority })
  }

  const buildingLabel = BUILDINGS.find((b) => b.value === step1.building)?.label ?? step1.building
  const roomTypeLabel = ROOM_TYPES.find((r) => r.value === step2.roomType)?.label ?? step2.roomType

  const conditionLabels: Record<string, string> = {
    good: 'Tốt', needs_repair: 'Cần sửa', broken: 'Hỏng'
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

        <div>
          <h3 style={{ marginBottom: 4 }}>Mức độ ưu tiên</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Đánh giá mức độ cần thiết sửa chữa
          </p>
        </div>

        {/* Survey Summary */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="section-title" style={{ marginBottom: 4 }}>Tóm tắt khảo sát</span>
          <SummaryRow label="Tòa nhà" value={buildingLabel} />
          <SummaryRow label="Phòng" value={`${step1.roomNumber} — Tầng ${step1.floor}`} />
          <SummaryRow label="Loại phòng" value={roomTypeLabel} />
          <SummaryRow label="Sức chứa" value={`${step2.capacity} chỗ`} />
          <SummaryRow label="Đánh giá" value={`${'★'.repeat(step2.overallRating)}${'☆'.repeat(5 - step2.overallRating)}`} />
          <SummaryRow label="Thiết bị hỏng" value={
            step3.brokenEquipment.length === 0
              ? 'Không có'
              : `${step3.brokenEquipment.length} thiết bị`
          } />
        </div>

        {/* Broken equipment list (if any) */}
        {step3.brokenEquipment.length > 0 && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="section-title">Thiết bị cần sửa</span>
            {step3.brokenEquipment.map((eq) => (
              <div key={eq.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingBottom: 10,
                borderBottom: '1px solid var(--color-border)',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: eq.severity === 'broken' ? 'var(--color-danger)' : 'var(--color-warning)',
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{eq.name}</span>
                <span className={`badge ${eq.severity === 'broken' ? 'badge--danger' : 'badge--warning'}`}>
                  {eq.severity === 'broken' ? 'Hỏng nặng' : 'Cần bảo trì'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Priority selector */}
        <div className="glass-card">
          <span className="section-title" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
            Mức độ ưu tiên sửa chữa
          </span>
          <div className="priority-grid">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                id={`priority-${opt.value}`}
                className={`priority-card priority-card--${opt.value} ${selectedPriority === opt.value ? 'priority-card--selected' : ''}`}
                onClick={() => {
                  setSelectedPriority(opt.value)
                  setValue('priority', opt.value)
                }}
              >
                <div
                  className="priority-card__icon"
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${opt.color}20`,
                    border: `2px solid ${opt.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 4,
                  }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: opt.color }} />
                </div>
                <div className="priority-card__label" style={{ color: selectedPriority === opt.value ? opt.color : undefined }}>
                  {opt.label}
                </div>
                <div className="priority-card__sub">{opt.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Estimated repair time */}
        <div className="glass-card">
          <div className="form-group">
            <label className="form-label">Thời gian dự kiến sửa chữa (tùy chọn)</label>
            <input
              id="step4-repair-time"
              type="text"
              className="form-input"
              placeholder="VD: 1 tuần, 3 ngày..."
              {...register('estimatedRepairTime')}
            />
          </div>

          <div className="divider" />

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Ghi chú thêm</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>
                {noteCount}/500
              </span>
            </label>
            <textarea
              id="step4-notes"
              className="form-input form-textarea"
              placeholder="Mô tả thêm về tình trạng cần ưu tiên sửa chữa..."
              rows={3}
              {...register('additionalNotes', {
                onChange: (e) => setNoteCount(e.target.value.length),
              })}
            />
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn--secondary btn--lg" onClick={onBack} disabled={isSubmitting}>
            <ChevronLeft size={18} /> Quay lại
          </button>
          <button
            id="step4-submit"
            type="submit"
            disabled={isSubmitting}
            className="btn btn--primary btn--lg"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Đang lưu...
              </>
            ) : (
              <>
                <Send size={18} />
                Gửi báo cáo
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}
