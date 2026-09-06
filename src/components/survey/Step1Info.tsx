import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { BUILDINGS } from '../../types'
import type { SurveyStep1 } from '../../types'
import { toISODate } from '../../utils/date'
import CustomSelect from '../ui/CustomSelect'

const schema = z.object({
  building: z.enum(['A', 'B', 'C', 'D1', 'D2', 'E1', 'E2', 'V'], {
    required_error: 'Vui lòng chọn tòa nhà',
  }),
  floor: z.coerce.number({ invalid_type_error: 'Vui lòng nhập số tầng' })
    .min(1, 'Tầng tối thiểu là 1')
    .max(15, 'Tầng tối đa là 15'),
  roomNumber: z.string().min(1, 'Vui lòng nhập số phòng').max(20),
  surveyDate: z.string().min(1, 'Vui lòng chọn ngày'),
})

type FormData = z.infer<typeof schema>

interface Step1InfoProps {
  defaultValues?: Partial<SurveyStep1>
  onNext: (data: SurveyStep1) => void
}

const KHU_K = BUILDINGS.filter((b) => b.campus === 'K')
const KHU_V = BUILDINGS.filter((b) => b.campus === 'V')

export default function Step1Info({ defaultValues, onNext }: Step1InfoProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      building: defaultValues?.building ?? 'A',
      floor: defaultValues?.floor ?? 1,
      roomNumber: defaultValues?.roomNumber ?? '',
      surveyDate: defaultValues?.surveyDate ?? toISODate(new Date()),
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

        <div>
          <h3 style={{ marginBottom: 4 }}>Thông tin cơ bản</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Nhập thông tin về vị trí phòng cần khảo sát
          </p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Building selector */}
          <div className="form-group">
            <label className="form-label">Tòa nhà</label>
            <Controller
              name="building"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  id="step1-building"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.building}
                  groups={['Khu K', 'Khu V']}
                  options={BUILDINGS.map((b) => ({
                    value: b.value,
                    label: b.label,
                    group: b.campus === 'K' ? 'Khu K' : 'Khu V',
                  }))}
                />
              )}
            />
            {errors.building && (
              <span className="form-error"><AlertCircle size={12} />{errors.building.message}</span>
            )}
          </div>

          {/* Floor + Room number (row) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Tầng</label>
              <input
                id="step1-floor"
                type="number"
                min={1} max={15}
                className={`form-input ${errors.floor ? 'form-input--error' : ''}`}
                placeholder="1"
                {...register('floor')}
              />
              {errors.floor && (
                <span className="form-error"><AlertCircle size={12} />{errors.floor.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Số phòng</label>
              <input
                id="step1-roomnumber"
                type="text"
                className={`form-input ${errors.roomNumber ? 'form-input--error' : ''}`}
                placeholder="VD: A201"
                {...register('roomNumber')}
              />
              {errors.roomNumber && (
                <span className="form-error"><AlertCircle size={12} />{errors.roomNumber.message}</span>
              )}
            </div>
          </div>

          {/* Survey date */}
          <div className="form-group">
            <label className="form-label">Ngày khảo sát</label>
            <input
              id="step1-date"
              type="date"
              className={`form-input ${errors.surveyDate ? 'form-input--error' : ''}`}
              {...register('surveyDate')}
            />
            {errors.surveyDate && (
              <span className="form-error"><AlertCircle size={12} />{errors.surveyDate.message}</span>
            )}
          </div>
        </div>

        {/* Next button */}
        <button
          id="step1-next"
          type="submit"
          className="btn btn--primary btn--full btn--lg"
        >
          Tiếp theo
          <ChevronRight size={18} />
        </button>
      </div>
    </form>
  )
}
