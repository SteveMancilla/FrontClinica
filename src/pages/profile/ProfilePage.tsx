import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Mail, Shield } from 'lucide-react'
import ChangePasswordCard from '@/components/profile/ChangePasswordCard'
import PageHeader from '@/components/layout/PageHeader'
import ProfileEditForm from '@/components/profile/ProfileEditForm'
import RoleBadge from '@/components/users/RoleBadge'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import { getCurrentUser } from '@/services/authService'
import { getUsers } from '@/services/userService'
import type { SystemUser } from '@/types/auth'
import { getUserInitials } from '@/utils/userCatalog'
import { getRoleLabel } from '@/utils/roleLabels'

export default function ProfilePage() {
  const sessionUser = getCurrentUser()
  const [profile, setProfile] = useState<SystemUser | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!sessionUser?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      const users = await getUsers()
      const match = users.find((u) => u.id === sessionUser.id) ?? null
      setProfile(match)
      if (!match) {
        setLoadError('No se encontraron los datos completos de tu cuenta.')
      }
    } catch {
      setLoadError('No se pudo cargar tu perfil. Intenta recargar la página.')
    } finally {
      setIsLoading(false)
    }
  }, [sessionUser?.id])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const displayName = profile?.fullName ?? sessionUser?.fullName ?? 'Usuario'
  const displayEmail = profile?.email ?? sessionUser?.email ?? '—'
  const displayRole = sessionUser?.role ?? profile?.role

  const roleDescription = useMemo(() => {
    switch (displayRole) {
      case 'admin':
        return 'Gestión global del sistema, usuarios y configuración.'
      case 'doctor':
        return 'Emisión de informes, asistentes asociados y atenciones médicas.'
      case 'assistant':
        return 'Registro de atenciones e informes bajo supervisión médica.'
      default:
        return 'Cuenta del sistema clínico.'
    }
  }, [displayRole])

  if (!sessionUser) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
        No hay sesión activa. Inicia sesión para ver tu perfil.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Información de tu cuenta y seguridad de acceso" />

      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </div>
      )}

      {isLoading && !profile && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-clinic-text/70">
          <Loader2 className="h-5 w-5 animate-spin text-clinic-blue" />
          Cargando perfil…
        </div>
      )}

      {profile && (
        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm">
            <div className="bg-gradient-to-br from-clinic-deep-blue via-clinic-blue to-clinic-teal px-6 py-8 text-clinic-white">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:gap-5 sm:text-left">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-2 ring-white/30 backdrop-blur-sm">
                  {getUserInitials(displayName)}
                </span>
                <div className="mt-4 sm:mt-0 sm:pb-1">
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <p className="mt-1 text-sm text-white/85">{displayEmail}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {displayRole && <RoleBadge role={displayRole} />}
                    <UserStatusBadge status={profile.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs">
                      <Shield className="h-3 w-3" />
                      {displayRole ? getRoleLabel(displayRole) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="border-b border-clinic-sky/30 px-6 py-3 text-sm text-clinic-text/75">
              {roleDescription}
              {profile.specialty || profile.position ? (
                <span className="mt-1 block font-medium text-clinic-deep-blue">
                  {profile.role === 'doctor'
                    ? profile.specialty
                    : profile.position}
                  {profile.role === 'assistant' && profile.supportArea
                    ? ` · ${profile.supportArea}`
                    : ''}
                </span>
              ) : null}
            </p>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ProfileEditForm
              profile={profile}
              role={sessionUser.role}
              onUpdated={setProfile}
            />
            <div className="space-y-6">
              <ChangePasswordCard />
              <section className="rounded-xl border border-clinic-sky/40 bg-clinic-sky/10 px-5 py-4">
                <h3 className="text-sm font-semibold text-clinic-deep-blue">Acceso a la cuenta</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-clinic-text/75">
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-clinic-teal" />
                    Correo de inicio de sesión:{' '}
                    <span className="font-medium">{displayEmail}</span>
                  </li>
                  <li>
                    Puedes actualizar tu nombre, contacto y datos profesionales en el formulario
                    de la izquierda.
                  </li>
                  <li>
                    Si olvidaste tu contraseña y no recuerdas la actual, solicita al administrador
                    que la restablezca.
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
