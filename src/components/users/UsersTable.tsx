import { type ReactNode } from 'react'
import { Eye, KeyRound, Pencil, Power } from 'lucide-react'
import RoleBadge from '@/components/users/RoleBadge'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import type { SystemUser } from '@/types/auth'
import { getUserInitials } from '@/utils/userCatalog'

interface UsersTableProps {
  users: SystemUser[]
  mode: 'admin' | 'doctor'
  canManage: boolean
  onView: (user: SystemUser) => void
  onEdit: (user: SystemUser) => void
  onToggleStatus: (user: SystemUser) => void
  onResetPassword: (user: SystemUser) => void
}

export default function UsersTable({
  users,
  mode,
  canManage,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white px-6 py-12 text-center text-sm text-clinic-text/60">
        No hay usuarios que coincidan con los filtros.
      </div>
    )
  }

  const adminHeaders = [
    'Usuario',
    'DNI',
    'Rol',
    'Especialidad / Cargo',
    'Área de apoyo',
    'Médico asociado',
    'Celular',
    'Correo',
    'Estado',
    'Último acceso',
    'Acciones',
  ]

  const doctorHeaders = [
    'Asistente',
    'DNI',
    'Cargo',
    'Área de apoyo',
    'Celular',
    'Correo',
    'Estado',
    'Último acceso',
    'Acciones',
  ]

  const headers = mode === 'admin' ? adminHeaders : doctorHeaders

  return (
    <div className="overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="border-b border-clinic-sky/60 bg-clinic-bg/50">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-clinic-sky/40">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-clinic-bg/30">
                <td className="px-4 py-3">
                  <UserCell user={user} />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{user.dni}</td>
                {mode === 'admin' && (
                  <>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 text-clinic-text">
                      {user.specialty ?? user.position ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-clinic-text/80">
                      {user.role === 'assistant' ? user.supportArea ?? '—' : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {user.role === 'assistant' ? (
                        user.associatedDoctorName ?? (
                          <span className="text-amber-700">Sin médico asociado</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                  </>
                )}
                {mode === 'doctor' && (
                  <>
                    <td className="px-4 py-3">{user.position ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-clinic-text/80">
                      {user.supportArea ?? '—'}
                    </td>
                  </>
                )}
                <td className="px-4 py-3">{user.phone}</td>
                <td className="px-4 py-3 text-xs">{user.email}</td>
                <td className="px-4 py-3">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-clinic-text/70">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString('es-PE')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <ActionBtn title="Ver detalle" onClick={() => onView(user)}>
                      <Eye className="h-4 w-4" />
                    </ActionBtn>
                    {canManage && user.role !== 'admin' && (
                      <>
                        <ActionBtn title="Editar" onClick={() => onEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </ActionBtn>
                        <ActionBtn
                          title={user.status === 'active' ? 'Desactivar' : 'Activar'}
                          onClick={() => onToggleStatus(user)}
                        >
                          <Power className="h-4 w-4" />
                        </ActionBtn>
                        <ActionBtn
                          title="Restablecer contraseña"
                          onClick={() => onResetPassword(user)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </ActionBtn>
                      </>
                    )}
                    {canManage && user.role === 'admin' && mode === 'admin' && (
                      <>
                        <ActionBtn title="Editar" onClick={() => onEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </ActionBtn>
                        <ActionBtn
                          title={user.status === 'active' ? 'Desactivar' : 'Activar'}
                          onClick={() => onToggleStatus(user)}
                        >
                          <Power className="h-4 w-4" />
                        </ActionBtn>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserCell({ user }: { user: SystemUser }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clinic-teal/15 text-xs font-bold text-clinic-teal">
        {getUserInitials(user.fullName)}
      </span>
      <span className="font-medium text-clinic-deep-blue">{user.fullName}</span>
    </div>
  )
}

function ActionBtn({
  children,
  onClick,
  title,
}: {
  children: ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg p-2 text-clinic-text/60 hover:bg-clinic-bg hover:text-clinic-blue"
    >
      {children}
    </button>
  )
}
