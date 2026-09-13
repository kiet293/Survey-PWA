import { useState } from 'react'
import { Plus, Trash2, Camera as CameraIcon, X, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import type { SurveyStep3, BrokenEquipment, EquipmentCondition } from '../../types'

const SEVERITY_OPTIONS: { value: EquipmentCondition; label: string; color: string }[] = [
  { value: 'needs_repair', label: 'Cần bảo trì', color: 'var(--color-warning)' },
  { value: 'broken', label: 'Hỏng nặng', color: 'var(--color-danger)' },
]

interface Step3EquipmentProps {
  defaultValues?: Partial<SurveyStep3>
  onNext: (data: SurveyStep3) => void
  onBack: () => void
}

function generateItemId() {
  return `eq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export default function Step3Equipment({ defaultValues, onNext, onBack }: Step3EquipmentProps) {
  const [items, setItems] = useState<BrokenEquipment[]>(
    defaultValues?.brokenEquipment ?? []
  )

  const addItem = () => {
    const newItem: BrokenEquipment = {
      id: generateItemId(),
      name: '',
      severity: 'needs_repair',
      description: '',
      photos: [],
    }
    setItems((prev) => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateItem = (id: string, updates: Partial<BrokenEquipment>) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...updates } : i))
  }

  const takePhoto = async (id: string) => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 80,
      })
      const base64 = `data:image/${photo.format};base64,${photo.base64String}`
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, photos: [...(i.photos ?? []), base64] }
            : i
        )
      )
    } catch (error) {
      console.error('User cancelled photo or error occurred', error)
    }
  }

  const removePhoto = (itemId: string, photoIdx: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, photos: i.photos?.filter((_, idx) => idx !== photoIdx) }
          : i
      )
    )
  }

  const handleNext = () => {
    // Filter out empty items
    const validItems = items.filter((i) => i.name.trim())
    onNext({ brokenEquipment: validItems })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      <div>
        <h3 style={{ marginBottom: 4 }}>Thiết bị hỏng</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Liệt kê các thiết bị bị hỏng hoặc cần bảo trì
        </p>
      </div>

      {/* Equipment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {items.map((item, idx) => (
          <div key={item.id} className="glass-card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* Item header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Thiết bị #{idx + 1}
              </span>
              <button
                type="button"
                className="btn btn--danger btn--sm btn--icon"
                onClick={() => removeItem(item.id)}
                id={`eq-remove-${item.id}`}
                style={{ width: 30, height: 30, padding: 0 }}
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Tên thiết bị</label>
              <input
                id={`eq-name-${item.id}`}
                type="text"
                className="form-input"
                placeholder="VD: Máy chiếu, Điều hòa, Bàn ghế..."
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
              />
            </div>

            {/* Severity */}
            <div className="form-group">
              <label className="form-label">Mức độ hỏng</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {SEVERITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`eq-severity-${item.id}-${opt.value}`}
                    onClick={() => updateItem(item.id, { severity: opt.value })}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${item.severity === opt.value ? opt.color : 'var(--color-border)'}`,
                      background: item.severity === opt.value ? `${opt.color}18` : 'var(--color-surface)',
                      color: item.severity === opt.value ? opt.color : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: 'var(--font-size-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Mô tả chi tiết (tùy chọn)</label>
              <textarea
                id={`eq-desc-${item.id}`}
                className="form-input form-textarea"
                placeholder="Mô tả cụ thể tình trạng hỏng..."
                rows={2}
                value={item.description ?? ''}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                style={{ minHeight: 64 }}
              />
            </div>

            {/* Photos */}
            <div className="form-group">
              <label className="form-label">Ảnh thiết bị</label>
              <div className="photo-grid">
                {(item.photos ?? []).map((src, pi) => (
                  <div key={pi} className="photo-thumb">
                    <img src={src} alt={`Ảnh ${pi + 1}`} />
                    <button
                      type="button"
                      className="photo-thumb__remove"
                      onClick={() => removePhoto(item.id, pi)}
                    >
                      <X size={8} />
                    </button>
                  </div>
                ))}
                {(item.photos?.length ?? 0) < 4 && (
                  <button
                    type="button"
                    className="photo-add-btn"
                    id={`eq-photo-${item.id}`}
                    onClick={() => takePhoto(item.id)}
                  >
                    <CameraIcon size={16} />
                    <span>Chụp ảnh</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          id="eq-add-btn"
          onClick={addItem}
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--color-border)',
            background: 'transparent',
            color: 'var(--color-primary)',
            fontWeight: 600,
            fontSize: 'var(--font-size-base)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.background = 'var(--color-primary-glow)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Plus size={18} />
          Thêm thiết bị hỏng
        </button>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="glass-card">
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <div className="empty-state__icon">
                <AlertTriangle size={24} color="var(--color-success)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Không có thiết bị hỏng?
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                  Tốt! Nếu có thiết bị hỏng, nhấn nút "Thêm" ở trên.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
        <button type="button" className="btn btn--secondary btn--lg" onClick={onBack}>
          <ChevronLeft size={18} /> Quay lại
        </button>
        <button id="step3-next" type="button" className="btn btn--primary btn--lg" onClick={handleNext}>
          Tiếp theo <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
