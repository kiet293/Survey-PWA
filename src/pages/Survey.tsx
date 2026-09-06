import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useSurveyStore } from '../store/surveyStore'
import type { Survey, SurveyStep1, SurveyStep2, SurveyStep3, SurveyStep4 } from '../types'
import { toISODate } from '../utils/date'
import StepIndicator from '../components/survey/StepIndicator'
import Step1Info from '../components/survey/Step1Info'
import Step2Room from '../components/survey/Step2Room'
import Step3Equipment from '../components/survey/Step3Equipment'
import Step4Priority from '../components/survey/Step4Priority'
import Toast from '../components/ui/Toast'

const STEPS = [
  { label: 'Thông tin' },
  { label: 'Phòng học' },
  { label: 'Thiết bị' },
  { label: 'Ưu tiên' },
]

function generateId(): string {
  return `survey_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default function SurveyPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addSurvey } = useSurveyStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Form data state
  const [step1Data, setStep1Data] = useState<SurveyStep1 | null>(null)
  const [step2Data, setStep2Data] = useState<SurveyStep2 | null>(null)
  const [step3Data, setStep3Data] = useState<SurveyStep3 | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleStep1Next = useCallback((data: SurveyStep1) => {
    setStep1Data(data)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleStep2Next = useCallback((data: SurveyStep2) => {
    setStep2Data(data)
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleStep3Next = useCallback((data: SurveyStep3) => {
    setStep3Data(data)
    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleStep4Submit = useCallback(async (data: SurveyStep4) => {
    if (!step1Data || !step2Data || !step3Data || !user) return

    const survey: Survey = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      surveyorEmail: user.email,
      surveyorName: user.name,
      status: 'submitted',
      syncStatus: 'pending',
      step1: step1Data,
      step2: step2Data,
      step3: step3Data,
      step4: data,
    }

    try {
      await addSurvey(survey)
      showToast('✅ Đã lưu báo cáo offline! Sẽ đồng bộ khi có mạng.', 'success')
      setTimeout(() => navigate('/'), 1800)
    } catch {
      showToast('Có lỗi xảy ra, vui lòng thử lại.', 'error')
    }
  }, [step1Data, step2Data, step3Data, user, addSurvey, navigate])

  const handleBack = () => {
    if (currentStep === 0) {
      navigate(-1)
    } else {
      setCurrentStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Survey Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(10,22,40,0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
          zIndex: 50,
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: '12px var(--content-padding)',
          }}
        >
          <button
            id="survey-back-btn"
            onClick={handleBack}
            className="btn btn--ghost btn--icon"
            style={{ width: 38, height: 38, flexShrink: 0 }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, lineHeight: 1.2 }}>
              Khảo sát cơ sở vật chất
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
              Bước {currentStep + 1} / {STEPS.length}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '8px 0 16px' }}>
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      {/* Step Content */}
      <div
        style={{
          flex: 1,
          padding: 'var(--content-padding)',
          paddingBottom: 40,
          maxWidth: 'var(--max-width)',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div className="animate-slide-up" key={currentStep}>
          {currentStep === 0 && (
            <Step1Info defaultValues={step1Data ?? undefined} onNext={handleStep1Next} />
          )}
          {currentStep === 1 && (
            <Step2Room defaultValues={step2Data ?? undefined} onNext={handleStep2Next} onBack={handleBack} />
          )}
          {currentStep === 2 && (
            <Step3Equipment defaultValues={step3Data ?? undefined} onNext={handleStep3Next} onBack={handleBack} />
          )}
          {currentStep === 3 && (
            <Step4Priority
              step1={step1Data!}
              step2={step2Data!}
              step3={step3Data!}
              onSubmit={handleStep4Submit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
