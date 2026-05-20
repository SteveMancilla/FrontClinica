import { Link, useLocation } from 'react-router-dom'
import { Menu, Plus } from 'lucide-react'
import GlobalSearch from '@/components/layout/GlobalSearch'
import NotificationsDropdown from '@/components/layout/NotificationsDropdown'
import { getPageTitle } from '@/config/navigation'
import { getCurrentUser } from '@/services/authService'
import { getInitials } from '@/utils/getInitials'
import { getRoleLabel } from '@/utils/roleLabels'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const user = getCurrentUser()
  const pageTitle = getPageTitle(location.pathname, user?.role)

  if (!user) return null

  return (
    <header className="sticky top-0 z-20 border-b border-clinic-sky/40 bg-clinic-white px-4 py-3 shadow-sm sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-clinic-deep-blue hover:bg-clinic-bg lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-clinic-deep-blue sm:text-xl">{pageTitle}</h1>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-3xl lg:justify-end">
          <GlobalSearch />

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/patients?newAppointment=1"
              className="inline-flex items-center gap-1.5 rounded-lg bg-clinic-blue px-3 py-2 text-sm font-semibold text-clinic-white transition hover:bg-clinic-deep-blue sm:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva atención</span>
              <span className="sm:hidden">Nueva</span>
            </Link>

            <NotificationsDropdown />

            <div className="flex items-center gap-2 border-l border-clinic-sky/60 pl-2 sm:pl-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-clinic-deep-blue">
                  {user.fullName.split(' ').slice(-2).join(' ') || user.fullName}
                </p>
                <p className="text-xs text-clinic-text/60">{getRoleLabel(user.role)}</p>
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-clinic-blue text-sm font-bold text-clinic-white"
                title={user.fullName}
              >
                {getInitials(user.fullName)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
