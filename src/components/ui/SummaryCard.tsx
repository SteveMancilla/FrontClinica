import type { ReactNode } from 'react'
import clsx from 'clsx'

interface SummaryCardProps {
  title: string
  value: number | string
  icon: ReactNode
  accent?: 'default' | 'warning' | 'success' | 'info' | 'danger' | 'purple'
  detail?: string
}

const accentStyles = {
  default: 'bg-clinic-blue/10 text-clinic-blue',
  warning: 'bg-amber-50 text-amber-600',
  success: 'bg-emerald-50 text-emerald-600',
  info: 'bg-clinic-sky/50 text-clinic-deep-blue',
  danger: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
}

export default function SummaryCard({
  title,
  value,
  icon,
  accent = 'default',
  detail,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-clinic-text/70">{title}</p>
          <p className="mt-2 text-3xl font-bold text-clinic-deep-blue">{value}</p>
          {detail && (
            <p className="mt-1 text-xs text-clinic-text/50">{detail}</p>
          )}
        </div>
        <div
          className={clsx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
            accentStyles[accent],
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
