import { Check } from 'lucide-react'

interface Step {
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isActive = i === currentStep

        return (
          <div
            key={i}
            className={`step-indicator__step ${isCompleted ? 'step-indicator__step--completed' : ''} ${isActive ? 'step-indicator__step--active' : ''}`}
          >
            <div className="step-indicator__dot">
              {isCompleted ? <Check size={12} strokeWidth={3} /> : i + 1}
            </div>
            <span className="step-indicator__label">{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}
