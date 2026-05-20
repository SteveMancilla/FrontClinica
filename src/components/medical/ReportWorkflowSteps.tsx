import clsx from 'clsx'
import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Plantilla cargada' },
  { id: 2, label: 'Dictado de hallazgos' },
  { id: 3, label: 'Impresión diagnóstica' },
  { id: 4, label: 'Revisión médica' },
  { id: 5, label: 'Conclusión' },
] as const

interface ReportWorkflowStepsProps {
  activeStep: number
}

export default function ReportWorkflowSteps({
  activeStep,
}: ReportWorkflowStepsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STEPS.map((step) => {
        const isComplete = step.id < activeStep
        const isCurrent = step.id === activeStep
        return (
          <span
            key={step.id}
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
              isComplete &&
                'border-clinic-teal/50 bg-clinic-teal/10 text-clinic-teal',
              isCurrent &&
                'border-clinic-blue bg-clinic-blue text-clinic-white',
              !isComplete &&
                !isCurrent &&
                'border-clinic-sky/60 bg-clinic-white text-clinic-text/60',
            )}
          >
            {isComplete ? (
              <Check className="h-3 w-3" />
            ) : (
              <span
                className={clsx(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                  isCurrent ? 'bg-clinic-white/20' : 'bg-clinic-bg',
                )}
              >
                {step.id}
              </span>
            )}
            {step.label}
          </span>
        )
      })}
    </div>
  )
}
