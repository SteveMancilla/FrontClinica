import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import clsx from 'clsx'
import { getNavItemsForRole } from '@/config/navigation'
import { getCurrentUser, logout } from '@/services/authService'
import type { AuthUser } from '@/types/auth'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function NavItems({ user, onNavigate }: { user: AuthUser; onNavigate?: () => void }) {
  const items = getNavItemsForRole(user.role)

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            end
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-clinic-sky text-clinic-deep-blue'
                  : 'text-clinic-white/85 hover:bg-clinic-white/10 hover:text-clinic-white',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const user = getCurrentUser()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const sidebarContent = (
    <>
      <div className="border-b border-clinic-white/10 px-5 py-5">
        <p className="text-lg font-bold text-clinic-white">Clínica</p>
        <p className="mt-0.5 text-xs text-clinic-sky/90">
          Profesionales de la salud a tu servicio
        </p>
      </div>

      <NavItems user={user} onNavigate={onClose} />

      <div className="border-t border-clinic-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-clinic-white/85 transition hover:bg-clinic-white/10 hover:text-clinic-white"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-full w-64 flex-col bg-clinic-deep-blue lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-clinic-deep-blue/50 lg:hidden"
          onClick={onClose}
          aria-label="Cerrar menú"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-clinic-deep-blue transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-clinic-white/80 hover:bg-clinic-white/10"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}
