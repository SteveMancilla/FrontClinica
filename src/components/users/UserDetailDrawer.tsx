import { type ReactNode } from 'react'
import { KeyRound, Pencil, Power, X } from 'lucide-react'
import RoleBadge from '@/components/users/RoleBadge'
import UserPermissionsCard from '@/components/users/UserPermissionsCard'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import type { AuthUser, SystemUser } from '@/types/auth'
import {
  getAssistantStats,
  getAssistantsForDoctor,
  getDoctorStats,
  getUserInitials,
} from '@/utils/userCatalog'

interface UserDetailDrawerProps {
  isOpen: boolean
  user: SystemUser | null
  currentUser: AuthUser | null
  allUsers: import('@/types/auth').SystemUser[]
  canManage: boolean
  onClose: () => void
  onEdit: () => void
  onToggleStatus: () => void
  onResetPassword: () => void
}

export default function UserDetailDrawer({
  isOpen,
  user,
  currentUser,
  allUsers,
  canManage,
  onClose,
  onEdit,
  onToggleStatus,
  onResetPassword,
}: UserDetailDrawerProps) {
  if (!isOpen || !user) return null

  const isSelf = currentUser?.id === user.id
  const doctorStats = user.role === 'doctor' ? getDoctorStats(user) : null
  const assistantStats = user.role === 'assistant' ? getAssistantStats(user) : null
  const linkedAssistants =
    user.role === 'doctor' && user.doctorId
      ? getAssistantsForDoctor(user.doctorId, allUsers)
      : []

  const showAdminActions =
    canManage &&
    !isSelf &&
    (currentUser?.role === 'admin' ||
      (currentUser?.role === 'doctor' && user.role === 'assistant'))

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-clinic-deep-blue/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-clinic-bg shadow-2xl">
        <header className="border-b border-clinic-sky/60 bg-clinic-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clinic-teal/15 text-lg font-bold text-clinic-teal">
                {getUserInitials(user.fullName)}
              </span>
              <div>
                <h2 className="text-lg font-bold text-clinic-deep-blue">Detalle de usuario</h2>
                <p className="font-medium">{user.fullName}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RoleBadge role={user.role} />
                  <UserStatusBadge status={user.status} />
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-clinic-bg">
              <X className="h-5 w-5" />
            </button>
          </div>
          {showAdminActions && (
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionBtn onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                Editar
              </ActionBtn>
              <ActionBtn onClick={onToggleStatus}>
                <Power className="h-4 w-4" />
                {user.status === 'active' ? 'Desactivar' : 'Activar'}
              </ActionBtn>
              <ActionBtn onClick={onResetPassword}>
                <KeyRound className="h-4 w-4" />
                Restablecer contraseña
              </ActionBtn>
            </div>
          )}
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
            <h3 className="font-semibold text-clinic-deep-blue">Datos principales</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <Item label="DNI" value={user.dni} />
              <Item label="Correo" value={user.email} />
              <Item label="Celular" value={user.phone} />
              <Item label="Dirección" value={user.address ?? '—'} />
              <Item label="Ciudad" value={user.originCity ?? '—'} />
              <Item
                label="Fecha de creación"
                value={new Date(user.createdAt).toLocaleDateString('es-PE')}
              />
              <Item
                label="Último acceso"
                value={
                  user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString('es-PE')
                    : '—'
                }
              />
            </dl>
          </section>

          {user.role === 'doctor' && (
            <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
              <h3 className="font-semibold text-clinic-deep-blue">Datos médicos</h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Item label="Especialidad / cargo" value={user.specialty ?? user.position ?? '—'} />
                <Item label="ID clínico" value={user.doctorId ?? '—'} mono />
              </dl>
              {doctorStats && (
                <ul className="mt-4 flex flex-wrap gap-3 text-xs">
                  <StatChip label="Informes" value={doctorStats.reports} />
                  <StatChip label="Estudios" value={doctorStats.studies} />
                  <StatChip label="Asistentes" value={doctorStats.assistants} />
                </ul>
              )}
              {linkedAssistants.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-clinic-deep-blue">
                    Asistentes asociados
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {linkedAssistants.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-lg bg-clinic-bg/50 px-3 py-2 text-sm"
                      >
                        {a.fullName}
                        <span className="ml-2 text-xs text-clinic-text/50">
                          {a.position}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {user.role === 'admin' && (
            <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
              <h3 className="font-semibold text-clinic-deep-blue">Datos administrativos</h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Item label="Cargo / título" value={user.position ?? '—'} />
              </dl>
            </section>
          )}

          {user.role === 'assistant' && (
            <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
              <h3 className="font-semibold text-clinic-deep-blue">Datos de asistente</h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Item label="Cargo" value={user.position ?? '—'} />
                <Item
                  label="Médico asociado"
                  value={user.associatedDoctorName ?? 'Sin médico asociado'}
                />
                <Item label="Área de apoyo" value={user.supportArea ?? '—'} />
              </dl>
              {assistantStats && (
                <ul className="mt-4 flex flex-wrap gap-3 text-xs">
                  <StatChip
                    label="Pacientes (atenciones)"
                    value={assistantStats.patientsRegistered}
                  />
                  <StatChip
                    label="Atenciones creadas"
                    value={assistantStats.appointmentsCreated}
                  />
                </ul>
              )}
            </section>
          )}

          {user.notes && (
            <p className="rounded-lg bg-clinic-bg/50 px-4 py-3 text-sm text-clinic-text/80">
              {user.notes}
            </p>
          )}

          <UserPermissionsCard role={user.role} />
        </div>

        <footer className="border-t border-clinic-sky/60 bg-clinic-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-clinic-sky py-2.5 text-sm font-medium"
          >
            Cerrar
          </button>
        </footer>
      </aside>
    </>
  )
}

function Item({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-xs text-clinic-text/50">{label}</dt>
      <dd className={`font-medium text-clinic-deep-blue ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-clinic-sky bg-clinic-bg px-3 py-1">
      {label}: <strong>{value}</strong>
    </span>
  )
}

function ActionBtn({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky bg-clinic-white px-3 py-2 text-xs font-medium hover:bg-clinic-bg"
    >
      {children}
    </button>
  )
}
