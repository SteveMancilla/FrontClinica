import clsx from 'clsx'
import type { StatusBadgeVariant } from '@/utils/appointmentStatus'

interface StatusBadgeProps {
  label: string
  variant?: StatusBadgeVariant
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  neutral: 'bg-clinic-bg text-clinic-text border-clinic-sky/80',
  info: 'bg-blue-50 text-clinic-blue border-blue-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
}

export default function StatusBadge({
  label,
  variant = 'neutral',
}: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        variantStyles[variant],
      )}
    >
      {label}
    </span>
  )
}
