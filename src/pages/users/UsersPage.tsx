import { useMemo, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Info,
  Plus,
  RotateCcw,
  Stethoscope,
  UserCog,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import RoleBadge from '@/components/users/RoleBadge'
import ResetPasswordModal from '@/components/users/ResetPasswordModal'
import ToggleStatusModal from '@/components/users/ToggleStatusModal'
import UserDetailDrawer from '@/components/users/UserDetailDrawer'
import UserFormDrawer, { type UserFormInput } from '@/components/users/UserFormDrawer'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import UsersTable from '@/components/users/UsersTable'
import SummaryCard from '@/components/ui/SummaryCard'
import { useUsersFromApi } from '@/hooks/useUsersFromApi'
import { ApiError } from '@/services/apiClient'
import { createUser, updateUser } from '@/services/userService'
import type { SystemUser, UserRole } from '@/types/auth'
import {
  defaultUserFilters,
  enrichUser,
  filterUsers,
  getAdminUserSummary,
  getDoctorOptionsForSelect,
  getDoctorUserSummary,
  getPositionOptions,
  getSpecialtyOptions,
  getUserInitials,
  getUsersForCurrentUser,
  roleLabels,
} from '@/utils/userCatalog'

export default function UsersPage() {
  const { currentUser, users, loadState, loadError, refetch } = useUsersFromApi()
  const [saveError, setSaveError] = useState<string | null>(null)
  const isAdmin = currentUser?.role === 'admin'
  const isDoctor = currentUser?.role === 'doctor'
  const isAssistant = currentUser?.role === 'assistant'
  const [filters, setFilters] = useState(defaultUserFilters)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [presetRole, setPresetRole] = useState<UserRole | null>(null)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [detailUser, setDetailUser] = useState<SystemUser | null>(null)
  const [toggleUser, setToggleUser] = useState<SystemUser | null>(null)
  const [resetUser, setResetUser] = useState<SystemUser | null>(null)

  const visibleUsers = useMemo(
    () => getUsersForCurrentUser(currentUser, users),
    [currentUser, users],
  )

  const filteredUsers = useMemo(
    () => filterUsers(visibleUsers, filters),
    [visibleUsers, filters],
  )

  const tableUsers = useMemo(() => {
    if (isDoctor) return filteredUsers.filter((u) => u.role === 'assistant')
    return filteredUsers
  }, [filteredUsers, isDoctor])

  const adminSummary = useMemo(
    () => getAdminUserSummary(visibleUsers),
    [visibleUsers],
  )
  const doctorSummary = useMemo(
    () => getDoctorUserSummary(visibleUsers),
    [visibleUsers],
  )

  const specialtyOptions = useMemo(
    () => getSpecialtyOptions(visibleUsers),
    [visibleUsers],
  )
  const positionOptions = useMemo(
    () => getPositionOptions(visibleUsers),
    [visibleUsers],
  )
  const doctorOptions = useMemo(() => getDoctorOptionsForSelect(users), [users])

  const selfProfile = useMemo(() => {
    if (!currentUser || currentUser.role !== 'assistant') return null
    const found = users.find((u) => u.id === currentUser.id)
    if (!found) return null
    return enrichUser(found, users)
  }, [currentUser, users])

  const pageTitle = isAdmin
    ? 'Usuarios'
    : isDoctor
      ? 'Mis asistentes'
      : 'Mi usuario'

  const pageSubtitle = isAdmin
    ? 'Gestiona administradores, médicos y asistentes del sistema.'
    : isDoctor
      ? 'Administra los asistentes asociados a tu trabajo médico.'
      : 'Consulta la información de tu usuario.'

  const infoText = isAdmin
    ? 'Registre usuarios desde un solo formulario: elija el rol (administrador, médico o asistente) y complete los datos correspondientes.'
    : isDoctor
      ? 'Como médico, solo puedes crear y gestionar asistentes asociados a tu usuario.'
      : 'Tu acceso está limitado a funciones operativas asignadas por el médico o administrador.'

  const openCreate = (role?: UserRole) => {
    setFormMode('create')
    setEditingUser(null)
    setPresetRole(role ?? null)
    setFormOpen(true)
  }

  const openEdit = (user: SystemUser) => {
    setFormMode('edit')
    setEditingUser(user)
    setPresetRole(null)
    setFormOpen(true)
  }

  const handleSaveUser = async (input: UserFormInput, existingId?: string) => {
    setSaveError(null)
    try {
      if (existingId) {
        await updateUser(existingId, input)
      } else {
        await createUser(input)
      }
      await refetch()
      setFormOpen(false)
    } catch (error) {
      setSaveError(
        error instanceof ApiError ? error.message : 'No se pudo guardar el usuario.',
      )
    }
  }

  const handleResetPassword = async (password: string) => {
    if (!resetUser) return
    setSaveError(null)
    try {
      await updateUser(resetUser.id, { password })
      await refetch()
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No se pudo restablecer la contraseña.'
      setSaveError(message)
      throw error instanceof Error ? error : new Error(message)
    }
  }

  const handleToggleStatus = async () => {
    if (!toggleUser) return
    const nextStatus = toggleUser.status === 'active' ? 'inactive' : 'active'
    try {
      await updateUser(toggleUser.id, { status: nextStatus })
      await refetch()
      if (detailUser?.id === toggleUser.id) {
        setDetailUser((d) => (d ? { ...d, status: nextStatus } : d))
      }
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'No se pudo cambiar el estado.',
      )
    } finally {
      setToggleUser(null)
    }
  }

  const canManage = isAdmin || isDoctor

  if (isDoctor) {
    return <Navigate to="/assistants" replace />
  }

  if (isAssistant) {
    if (loadState === 'loading') {
      return (
        <div className="space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-clinic-deep-blue">{pageTitle}</h1>
            <p className="mt-1 text-sm text-clinic-text/70">{pageSubtitle}</p>
          </header>
          <p className="py-8 text-center text-sm text-clinic-text/70">Cargando perfil...</p>
        </div>
      )
    }

    if (!selfProfile) {
      return (
        <div className="space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-clinic-deep-blue">{pageTitle}</h1>
            <p className="mt-1 text-sm text-clinic-text/70">{pageSubtitle}</p>
          </header>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError ?? 'No se pudo cargar tu perfil de usuario.'}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-clinic-deep-blue">{pageTitle}</h1>
          <p className="mt-1 text-sm text-clinic-text/70">{pageSubtitle}</p>
        </header>
        <InfoBanner text={infoText} />
        <AssistantProfileCard user={selfProfile} onView={() => setDetailUser(selfProfile)} />
        <UserDetailDrawer
          isOpen={Boolean(detailUser)}
          user={detailUser}
          currentUser={currentUser}
          allUsers={users}
          canManage={false}
          onClose={() => setDetailUser(null)}
          onEdit={() => {}}
          onToggleStatus={() => {}}
          onResetPassword={() => {}}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader description={pageSubtitle}>
        {isAdmin && (
          <HeaderBtn onClick={() => openCreate()} primary>
            <UserPlus className="h-4 w-4" />
            Nuevo usuario
          </HeaderBtn>
        )}
        {isDoctor && (
          <HeaderBtn onClick={() => openCreate('assistant')} primary>
            <Plus className="h-4 w-4" />
            Nuevo asistente
          </HeaderBtn>
        )}
      </PageHeader>

      <InfoBanner text={infoText} />

      {(saveError || loadError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError ?? loadError}
        </div>
      )}

      {loadState === 'loading' && (
        <p className="py-8 text-center text-sm text-clinic-text/70">Cargando usuarios...</p>
      )}

      {isAdmin && loadState === 'success' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total de usuarios" value={adminSummary.total} icon={<Users className="h-5 w-5" />} />
          <SummaryCard
            title="Médicos activos"
            value={adminSummary.activeDoctors}
            icon={<Stethoscope className="h-5 w-5" />}
            accent="info"
          />
          <SummaryCard
            title="Asistentes activos"
            value={adminSummary.activeAssistants}
            icon={<UserPlus className="h-5 w-5" />}
            accent="success"
          />
          <SummaryCard
            title="Usuarios inactivos"
            value={adminSummary.inactive}
            icon={<UserX className="h-5 w-5" />}
            accent="warning"
          />
        </div>
      )}

      {isDoctor && loadState === 'success' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Mis asistentes"
            value={doctorSummary.totalAssistants}
            icon={<Users className="h-5 w-5" />}
          />
          <SummaryCard
            title="Asistentes activos"
            value={doctorSummary.activeAssistants}
            icon={<UserPlus className="h-5 w-5" />}
            accent="success"
          />
          <SummaryCard
            title="Asistentes inactivos"
            value={doctorSummary.inactiveAssistants}
            icon={<UserX className="h-5 w-5" />}
            accent="warning"
          />
          <SummaryCard
            title="Último asistente registrado"
            value={doctorSummary.lastAssistantName}
            icon={<UserCog className="h-5 w-5" />}
            accent="info"
          />
        </div>
      )}

      {(isAdmin || isDoctor) && loadState === 'success' && (
        <FiltersPanel
          isAdmin={isAdmin}
          filters={filters}
          specialtyOptions={specialtyOptions}
          positionOptions={positionOptions}
          doctorOptions={doctorOptions}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onClear={() => setFilters(defaultUserFilters)}
        />
      )}

      {loadState === 'success' && (
        <UsersTable
          users={tableUsers}
          mode={isAdmin ? 'admin' : 'doctor'}
          canManage={canManage}
          onView={setDetailUser}
          onEdit={openEdit}
          onToggleStatus={setToggleUser}
          onResetPassword={setResetUser}
        />
      )}

      <UserFormDrawer
        isOpen={formOpen}
        mode={formMode}
        initial={editingUser}
        presetRole={presetRole}
        currentUser={currentUser}
        allUsers={users}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveUser}
      />

      <UserDetailDrawer
        isOpen={Boolean(detailUser)}
        user={detailUser}
        currentUser={currentUser}
        allUsers={users}
        canManage={canManage}
        onClose={() => setDetailUser(null)}
        onEdit={() => detailUser && openEdit(detailUser)}
        onToggleStatus={() => detailUser && setToggleUser(detailUser)}
        onResetPassword={() => detailUser && setResetUser(detailUser)}
      />

      <ToggleStatusModal
        isOpen={Boolean(toggleUser)}
        user={toggleUser}
        onClose={() => setToggleUser(null)}
        onConfirm={handleToggleStatus}
      />

      <ResetPasswordModal
        isOpen={Boolean(resetUser)}
        user={resetUser}
        onClose={() => setResetUser(null)}
        onConfirm={handleResetPassword}
      />
    </div>
  )
}

function InfoBanner({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-clinic-teal/30 bg-clinic-sky/20 px-4 py-3 text-sm text-clinic-deep-blue">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-clinic-teal" />
      <p>{text}</p>
    </div>
  )
}

function HeaderBtn({
  children,
  onClick,
  primary,
}: {
  children: ReactNode
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? 'inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue'
          : 'inline-flex items-center gap-2 rounded-lg border border-clinic-sky bg-clinic-white px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg'
      }
    >
      {children}
    </button>
  )
}

function FiltersPanel({
  isAdmin,
  filters,
  specialtyOptions,
  positionOptions,
  doctorOptions,
  onChange,
  onClear,
}: {
  isAdmin: boolean
  filters: typeof defaultUserFilters
  specialtyOptions: string[]
  positionOptions: string[]
  doctorOptions: { id: string; name: string }[]
  onChange: (patch: Partial<typeof defaultUserFilters>) => void
  onClear: () => void
}) {
  const selectClass =
    'rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm'

  return (
    <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Nombre, DNI, correo o celular..."
          className={`${selectClass} sm:col-span-2 lg:col-span-2`}
        />
        {isAdmin && (
          <select
            value={filters.role}
            onChange={(e) =>
              onChange({ role: e.target.value as typeof filters.role })
            }
            className={selectClass}
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="doctor">Médico</option>
            <option value="assistant">Asistente</option>
          </select>
        )}
        {isAdmin && (
          <select
            value={filters.specialty}
            onChange={(e) => onChange({ specialty: e.target.value })}
            className={selectClass}
          >
            <option value="all">Todas las especialidades</option>
            {specialtyOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        {!isAdmin && (
          <select
            value={filters.position}
            onChange={(e) => onChange({ position: e.target.value })}
            className={selectClass}
          >
            <option value="all">Todos los cargos</option>
            {positionOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({ status: e.target.value as typeof filters.status })
          }
          className={selectClass}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
        {isAdmin && (
          <select
            value={filters.associatedDoctorId}
            onChange={(e) => onChange({ associatedDoctorId: e.target.value })}
            className={selectClass}
          >
            <option value="all">Todos los médicos asociados</option>
            {doctorOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-clinic-sky px-3 py-2.5 text-sm font-medium hover:bg-clinic-bg"
        >
          <RotateCcw className="h-4 w-4" />
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}

function AssistantProfileCard({
  user,
  onView,
}: {
  user: SystemUser
  onView: () => void
}) {
  return (
    <article className="mx-auto max-w-lg rounded-xl border border-clinic-sky/50 bg-clinic-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-clinic-teal/15 text-xl font-bold text-clinic-teal">
          {getUserInitials(user.fullName)}
        </span>
        <h2 className="mt-4 text-xl font-bold text-clinic-deep-blue">{user.fullName}</h2>
        <div className="mt-2 flex gap-2">
          <RoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
        </div>
      </div>
      <dl className="mt-6 space-y-3 text-sm">
        <ProfileRow label="Rol actual" value={roleLabels[user.role]} />
        <ProfileRow
          label="Médico asociado"
          value={user.associatedDoctorName ?? 'Sin médico asociado'}
        />
        <ProfileRow label="Estado" value={user.status === 'active' ? 'Activo' : 'Inactivo'} />
        <ProfileRow
          label="Último acceso"
          value={
            user.lastLogin
              ? new Date(user.lastLogin).toLocaleString('es-PE')
              : '—'
          }
        />
        <ProfileRow label="Correo" value={user.email} />
        <ProfileRow label="Celular" value={user.phone} />
      </dl>
      <button
        type="button"
        onClick={onView}
        className="mt-6 w-full rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white"
      >
        Ver perfil completo
      </button>
    </article>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-clinic-sky/30 pb-2">
      <dt className="text-clinic-text/60">{label}</dt>
      <dd className="font-medium text-clinic-deep-blue text-right">{value}</dd>
    </div>
  )
}
