import { useMemo, useState } from 'react'
import { Info, Loader2, Plus, RotateCcw, UserCog, UserPlus, Users, UserX } from 'lucide-react'
import ResetPasswordModal from '@/components/users/ResetPasswordModal'
import ToggleStatusModal from '@/components/users/ToggleStatusModal'
import UserDetailDrawer from '@/components/users/UserDetailDrawer'
import UserFormDrawer, { type UserFormInput } from '@/components/users/UserFormDrawer'
import PageHeader from '@/components/layout/PageHeader'
import UsersTable from '@/components/users/UsersTable'
import SummaryCard from '@/components/ui/SummaryCard'
import { useUsersFromApi } from '@/hooks/useUsersFromApi'
import { ApiError } from '@/services/apiClient'
import { createUser, updateUser } from '@/services/userService'
import type { SystemUser } from '@/types/auth'
import {
  defaultUserFilters,
  filterUsers,
  getDoctorUserSummary,
  getPositionOptions,
  getUsersForCurrentUser,
} from '@/utils/userCatalog'

export default function DoctorAssistantsManagement() {
  const { currentUser, users, loadState, loadError, refetch } = useUsersFromApi()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [filters, setFilters] = useState(defaultUserFilters)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [detailUser, setDetailUser] = useState<SystemUser | null>(null)
  const [toggleUser, setToggleUser] = useState<SystemUser | null>(null)
  const [resetUser, setResetUser] = useState<SystemUser | null>(null)

  const visibleUsers = useMemo(
    () => getUsersForCurrentUser(currentUser, users),
    [currentUser, users],
  )

  const assistants = useMemo(
    () => filterUsers(visibleUsers, filters).filter((u) => u.role === 'assistant'),
    [visibleUsers, filters],
  )

  const doctorSummary = useMemo(() => getDoctorUserSummary(visibleUsers), [visibleUsers])

  const positionOptions = useMemo(() => getPositionOptions(visibleUsers), [visibleUsers])

  const openCreate = () => {
    setFormMode('create')
    setEditingUser(null)
    setFormOpen(true)
  }

  const openEdit = (user: SystemUser) => {
    setFormMode('edit')
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleSaveUser = async (input: UserFormInput, existingId?: string) => {
    setSaveError(null)
    try {
      const payload = {
        ...input,
        role: 'assistant' as const,
        associatedDoctorId: currentUser?.id ?? input.associatedDoctorId,
      }

      if (existingId) {
        await updateUser(existingId, payload)
      } else {
        await createUser(payload)
      }

      await refetch()
      setFormOpen(false)
    } catch (error) {
      setSaveError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo guardar el asistente.',
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

  return (
    <div className="space-y-6">
      <PageHeader description="Administra los asistentes asociados a tu trabajo médico.">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
        >
          <Plus className="h-4 w-4" />
          Nuevo asistente
        </button>
      </PageHeader>

      {(saveError || loadError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError ?? loadError}
        </div>
      )}

      {loadState === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-clinic-text/70">
          <Loader2 className="h-5 w-5 animate-spin text-clinic-blue" />
          Cargando asistentes...
        </div>
      )}

      {loadState === 'success' && (
        <>
      <div className="flex gap-3 rounded-xl border border-clinic-teal/30 bg-clinic-sky/20 px-4 py-3 text-sm text-clinic-deep-blue">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-clinic-teal" />
        <p>
          Como médico, puedes registrar asistentes vinculados a tu usuario. Ellos podrán
          apoyar en registro de pacientes, atenciones e informes según su rol operativo.
          Los pacientes que registren quedarán visibles también para ti.
        </p>
      </div>

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

      <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Nombre, DNI, correo o celular..."
            className="rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm sm:col-span-2"
          />
          <select
            value={filters.position}
            onChange={(e) => setFilters((prev) => ({ ...prev, position: e.target.value }))}
            className="rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm"
          >
            <option value="all">Todos los cargos</option>
            {positionOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as typeof filters.status,
              }))
            }
            className="rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <button
            type="button"
            onClick={() => setFilters(defaultUserFilters)}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-clinic-sky px-3 py-2.5 text-sm font-medium hover:bg-clinic-bg sm:col-span-2 lg:col-span-1"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar filtros
          </button>
        </div>
      </div>

      {assistants.length === 0 ? (
        <EmptyAssistantsState
          hasFilters={
            Boolean(filters.search.trim()) ||
            filters.status !== 'all' ||
            filters.position !== 'all'
          }
          onRegister={openCreate}
        />
      ) : (
        <UsersTable
          users={assistants}
          mode="doctor"
          canManage
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
        presetRole="assistant"
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
        canManage
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
        </>
      )}
    </div>
  )
}

function EmptyAssistantsState({
  hasFilters,
  onRegister,
}: {
  hasFilters: boolean
  onRegister: () => void
}) {
  return (
    <div className="rounded-xl border border-dashed border-clinic-sky/60 bg-clinic-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinic-teal/10 text-clinic-teal">
        <Users className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-clinic-deep-blue">
        {hasFilters ? 'Sin resultados' : 'Aún no tienes asistentes registrados'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-clinic-text/70">
        {hasFilters
          ? 'Prueba con otros filtros o limpia la búsqueda.'
          : 'Registra a tu equipo de apoyo para que colabore en pacientes, atenciones e informes.'}
      </p>
      {!hasFilters && (
        <button
          type="button"
          onClick={onRegister}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
        >
          <Plus className="h-4 w-4" />
          Registrar primer asistente
        </button>
      )}
    </div>
  )
}
