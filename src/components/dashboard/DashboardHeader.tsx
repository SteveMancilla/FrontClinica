import { Link } from 'react-router-dom'
import type { AuthUser } from '@/types/auth'
import { getRoleLabel } from '@/utils/roleLabels'
import {
  getDashboardSubtitle,
  getGreetingTitle,
  getTodayIso,
} from '@/utils/dashboard'

interface DashboardHeaderProps {
  user: AuthUser
  quickAction?: { label: string; to: string }
}

export default function DashboardHeader({ user, quickAction }: DashboardHeaderProps) {
  const today = new Date(`${getTodayIso()}T12:00:00`)
  const dateLabel = today.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-clinic-deep-blue sm:text-3xl">
          {getGreetingTitle(user.fullName, user.role)}
        </h1>
        <p className="mt-2 text-sm text-clinic-text/70">{getDashboardSubtitle(user.role)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-clinic-text/60">
          <span className="rounded-full bg-clinic-bg px-3 py-1 capitalize">{dateLabel}</span>
          <span className="rounded-full border border-clinic-sky/60 bg-clinic-white px-3 py-1">
            {getRoleLabel(user.role)}
          </span>
          {user.specialty && (
            <span className="rounded-full border border-clinic-teal/40 bg-clinic-teal/10 px-3 py-1 text-clinic-teal">
              {user.specialty}
            </span>
          )}
        </div>
      </div>
      {quickAction && (
        <Link
          to={quickAction.to}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-clinic-blue px-5 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
        >
          {quickAction.label}
        </Link>
      )}
    </header>
  )
}
