import { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, ChevronLeft, Camera, X } from 'lucide-react'
import { ROOM_TYPES } from '../../types'
import type { SurveyStep2, EquipmentCondition } from '../../types'

const schema = z.object({
  roomType: z.enum(['theory', 'lab', 'auditorium', 'meeting']),
  capacity: z.number().min(1, 'Sức chứa phải lớn hơn 0').max(500),
  overallRating: z.number().min(1, 'Vui lòng đánh giá').max(5),
  airConditioner: z.enum(['good', 'needs_repair', 'broken']),
  projector: z.enum(['good', 'needs_repair', 'broken']),
  whiteboard: z.enum(['good', 'needs_repair', 'broken']),
  lighting: z.enum(['good', 'needs_repair', 'broken']),
  doors: z.enum(['good', 'needs_repair', 'broken']),
  photos: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof schema>

// ─── Condition config ─────────────────────────
const CONDITIONS: { value: EquipmentCondition; label: string; color: string; bg: string; border: string }[] = [
  { value: 'good',         label: '✓ Tốt',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)' },
  { value: 'needs_repair', label: '⚠ Cần sửa',  color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)' },
  { value: 'broken',       label: '✕ Hỏng',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)' },
]

const FACILITIES: {
  key: keyof Pick<FormData, 'airConditioner' | 'projector' | 'whiteboard' | 'lighting' | 'doors'>
  label: string
  icon: string
}[] = [
  { key: 'airConditioner', label: 'Điều hòa',       icon: '❄️' },
  { key: 'projector',      label: 'Máy chiếu',      icon: '📽️' },
  { key: 'whiteboard',     label: 'Bảng viết',      icon: '📋' },
  { key: 'lighting',       label: 'Đèn chiếu sáng', icon: '💡' },
  { key: 'doors',          label: 'Cửa / Cửa sổ',  icon: '🚪' },
]

interface Step2RoomProps {
  defaultValues?: Partial<SurveyStep2>
  onNext: (data: SurveyStep2) => void
  onBack: () => void
}

// ─── Condition Selector Component ─────────────
function ConditionSelector({
  value,
  onChange,
  id,
}: {
  value: EquipmentCondition
  onChange: (v: EquipmentCondition) => void
  id: string
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {CONDITIONS.map((c) => {
        const isActive = value === c.value
        return (
          <button
            key={c.value}
            type="button"
            id={`${id}-${c.value}`}
            onClick={() => onChange(c.value)}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: 8,
              border: `1.5px solid ${isActive ? c.border : 'var(--color-border)'}`,
              background: isActive ? c.bg : 'transparent',
              color: isActive ? c.color : 'var(--text-muted)',
              fontFamily: 'var(--font-family)',
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: isActive ? `0 0 0 2px ${c.border}` : 'none',
              outline: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Star Rating Component ────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const LABELS = ['', 'Rất kém', 'Kém', 'Bình thường', 'Tốt', 'Rất tốt']

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const lit = star <= (hover || value)
          return (
            <button
              key={star}
              type="button"
              id={`step2-star-${star}`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(star)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.15s ease',
                transform: hover === star ? 'scale(1.25)' : 'scale(1)',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={lit ? '#fbbf24' : 'none'}
                stroke={lit ? '#fbbf24' : '#334155'}
                strokeWidth={lit ? 0 : 1.5}
                style={{ filter: lit ? 'drop-shadow(0 0 5px rgba(251,191,36,0.5))' : 'none', transition: 'all 0.15s ease' }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          )
        })}
        {(hover || value) > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4, fontStyle: 'italic' }}>
            {LABELS[hover || value]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Step2Room({ defaultValues, onNext, onBack }: Step2RoomProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>(defaultValues?.photos ?? [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomType: defaultValues?.roomType ?? 'theory',
      capacity: defaultValues?.capacity ?? 45,
      overallRating: defaultValues?.overallRating ?? 0,
      airConditioner: defaultValues?.airConditioner ?? 'good',
      projector: defaultValues?.projector ?? 'good',
      whiteboard: defaultValues?.whiteboard ?? 'good',
      lighting: defaultValues?.lighting ?? 'good',
      doors: defaultValues?.doors ?? 'good',
      photos: defaultValues?.photos ?? [],
    },
  })

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string
        setPhotos((prev) => {
          const next = [...prev, base64]
          setValue('photos', next)
          return next
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      setValue('photos', next)
      return next
    })
  }

  const onSubmit = (data: FormData) => {
    onNext({ ...data, photos } as SurveyStep2)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

        <div>
          <h3 style={{ marginBottom: 4 }}>Khảo sát phòng học</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Đánh giá tình trạng cơ sở vật chất
          </p>
        </div>

        {/* Room type + capacity */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <span className="section-title" style={{ display: 'block', marginBottom: 12 }}>Loại phòng</span>
            <Controller
              name="roomType"
              control={control}
              render={({ field }) => (
                <div className="pill-group">
                  {ROOM_TYPES.map((rt) => (
                    <button
                      key={rt.value}
                      type="button"
                      id={`step2-type-${rt.value}`}
                      className={`pill ${field.value === rt.value ? 'pill--active' : ''}`}
                      onClick={() => field.onChange(rt.value)}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sức chứa (chỗ ngồi)</label>
            <input
              id="step2-capacity"
              type="number"
              min={1}
              max={500}
              className={`form-input ${errors.capacity ? 'form-input--error' : ''}`}
              {...register('capacity', { valueAsNumber: true })}
            />
            {errors.capacity && (
              <span className="form-error">{errors.capacity.message}</span>
            )}
          </div>
        </div>

        {/* Overall rating */}
        <div className="glass-card">
          <span className="section-title" style={{ display: 'block', marginBottom: 14 }}>Đánh giá tổng thể</span>
          <Controller
            name="overallRating"
            control={control}
            render={({ field }) => (
              <>
                <StarRating value={field.value} onChange={field.onChange} />
                {errors.overallRating && (
                  <p style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 8 }}>
                    {errors.overallRating.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* Facility conditions */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <span className="section-title">Tình trạng thiết bị cố định</span>
          {FACILITIES.map((fac, idx) => (
            <div
              key={fac.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                paddingBottom: idx < FACILITIES.length - 1 ? 'var(--space-4)' : 0,
                borderBottom: idx < FACILITIES.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minWidth: 120 }}>
                <span style={{ fontSize: 18 }}>{fac.icon}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {fac.label}
                </span>
              </div>
              <Controller
                name={fac.key}
                control={control}
                render={({ field }) => (
                  <ConditionSelector
                    id={`step2-${fac.key}`}
                    value={field.value as EquipmentCondition}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          ))}
        </div>

        {/* Photo capture */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="section-title">Ảnh hiện trạng phòng</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 20 }}>
              Tùy chọn
            </span>
          </div>
          <div className="photo-grid">
            {photos.map((src, idx) => (
              <div key={idx} className="photo-thumb">
                <img src={src} alt={`Ảnh ${idx + 1}`} />
                <button className="photo-thumb__remove" onClick={() => removePhoto(idx)} type="button">
                  <X size={10} />
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <button
                type="button"
                className="photo-add-btn"
                id="step2-add-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={20} />
                <span>Thêm ảnh</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotoCapture}
          />
        </div>

        {/* Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn--secondary btn--lg" onClick={onBack}>
            <ChevronLeft size={18} /> Quay lại
          </button>
          <button id="step2-next" type="submit" className="btn btn--primary btn--lg">
            Tiếp theo <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </form>
  )
}
