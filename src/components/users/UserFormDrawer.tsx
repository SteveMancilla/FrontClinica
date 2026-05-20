import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Save, X } from 'lucide-react'
import type { AuthUser, SystemUser, UserRole } from '@/types/auth'
import { getDoctorOptionsForSelect } from '@/utils/userCatalog'

export interface UserFormInput {
  dni: string
  fullName: string
  email: string
  phone: string
  address: string
  originCity: string
  role: UserRole
  status: 'active' | 'inactive'
  password: string
  confirmPassword: string
  notes: string
  specialty: string
  signatureLabel: string
  scheduleNotes: string
  position: string
  associatedDoctorId: string
  supportArea: string
}

interface UserFormDrawerProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initial?: SystemUser | null
  presetRole?: UserRole | null
  currentUser: AuthUser | null
  allUsers: SystemUser[]
  onClose: () => void
  onSave: (input: UserFormInput, existingId?: string) => void
}

const inputClass =
  'mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm focus:border-clinic-blue focus:outline-none focus:ring-1 focus:ring-clinic-blue'

const emptyForm = (role: UserRole = 'assistant'): UserFormInput => ({
  dni: '',
  fullName: '',
  email: '',
  phone: '',
  address: '',
  originCity: 'Huancayo',
  role,
  status: 'active',
  password: '',
  confirmPassword: '',
  notes: '',
  specialty: '',
  signatureLabel: '',
  scheduleNotes: '',
  position: role === 'admin' ? 'Administrador del sistema' : 'Asistente médico',
  associatedDoctorId: '',
  supportArea: '',
})

export default function UserFormDrawer({
  isOpen,
  mode,
  initial,
  presetRole,
  currentUser,
  allUsers,
  onClose,
  onSave,
}: UserFormDrawerProps) {
  const isAdmin = currentUser?.role === 'admin'
  const isDoctor = currentUser?.role === 'doctor'
  const lockedRole = isDoctor ? 'assistant' : presetRole ?? null

  const [form, setForm] = useState<UserFormInput>(emptyForm())
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const doctorOptions = getDoctorOptionsForSelect(allUsers)

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setSaved(false)

    if (initial && mode === 'edit') {
      setForm({
        dni: initial.dni,
        fullName: initial.fullName,
        email: initial.email,
        phone: initial.phone,
        address: initial.address ?? '',
        originCity: initial.originCity ?? '',
        role: initial.role,
        status: initial.status,
        password: '',
        confirmPassword: '',
        notes: initial.notes ?? '',
        specialty: initial.specialty ?? '',
        signatureLabel: initial.signatureLabel ?? '',
        scheduleNotes: initial.scheduleNotes ?? '',
        position: initial.position ?? 'Asistente médico',
        associatedDoctorId: initial.associatedDoctorId ?? '',
        supportArea: initial.supportArea ?? '',
      })
    } else {
      const role = lockedRole ?? presetRole ?? 'assistant'
      const base = emptyForm(role)
      if (isDoctor && currentUser?.id) {
        base.associatedDoctorId = currentUser.id
      }
      setForm(base)
    }
  }, [isOpen, initial, mode, presetRole, lockedRole, isDoctor, currentUser?.id])

  if (!isOpen) return null

  const effectiveRole = lockedRole ?? form.role

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.dni.trim() || !form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Complete los campos obligatorios.')
      return
    }

    if (effectiveRole === 'doctor' && !form.specialty.trim()) {
      setError('La especialidad es obligatoria para médicos.')
      return
    }

    if (effectiveRole === 'assistant') {
      if (!form.position.trim()) {
        setError('El cargo es obligatorio para asistentes.')
        return
      }
      if (!form.associatedDoctorId) {
        setError('Seleccione el médico asociado.')
        return
      }
    }

    if (effectiveRole === 'admin' && !form.position.trim()) {
      setError('Indique el cargo o título del administrador.')
      return
    }

    if (mode === 'create') {
      if (!form.password || form.password.length < 6) {
        setError('Ingrese una contraseña temporal de al menos 6 caracteres.')
        return
      }
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden.')
        return
      }
    }

    onSave(
      { ...form, role: effectiveRole },
      mode === 'edit' ? initial?.id : undefined,
    )
    setSaved(true)
    if (mode === 'create') {
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1200)
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-clinic-deep-blue/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-clinic-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-clinic-sky/60 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-clinic-deep-blue">
              {mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
            </h2>
            <p className="text-xs text-clinic-text/60">
              {isDoctor && 'Solo puede crear asistentes asociados a su perfil.'}
              {isAdmin &&
                (mode === 'create'
                  ? 'Seleccione el rol y complete los datos. Los campos varían según administrador, médico o asistente.'
                  : 'Actualice los datos del usuario. El rol no se modifica al editar.')}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-clinic-bg">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="grid flex-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2">
            <Field label="DNI *">
              <input
                required
                value={form.dni}
                onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Estado">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as 'active' | 'inactive',
                  }))
                }
                className={inputClass}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </Field>
            <Field label="Nombres y apellidos *" className="sm:col-span-2">
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Correo *">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Celular *">
              <input
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Dirección">
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Ciudad / procedencia">
              <input
                value={form.originCity}
                onChange={(e) => setForm((f) => ({ ...f, originCity: e.target.value }))}
                className={inputClass}
              />
            </Field>

            {isAdmin && !lockedRole && mode === 'create' && (
              <Field label="Rol *" className="sm:col-span-2">
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value as UserRole }))
                  }
                  className={inputClass}
                >
                  <option value="admin">Administrador</option>
                  <option value="doctor">Médico</option>
                  <option value="assistant">Asistente</option>
                </select>
              </Field>
            )}

            {(lockedRole || (isAdmin && mode === 'edit')) && (
              <Field label="Rol" className="sm:col-span-2">
                <input
                  readOnly
                  value={
                    effectiveRole === 'admin'
                      ? 'Administrador'
                      : effectiveRole === 'doctor'
                        ? 'Médico'
                        : 'Asistente'
                  }
                  className={`${inputClass} bg-clinic-bg/50`}
                />
              </Field>
            )}

            {effectiveRole === 'admin' && (
              <Field label="Cargo / título *" className="sm:col-span-2">
                <input
                  required
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  placeholder="Ej. Administrador del sistema"
                  className={inputClass}
                />
              </Field>
            )}

            {effectiveRole === 'doctor' && (
              <>
                <Field label="Especialidad / cargo *" className="sm:col-span-2">
                  <input
                    required
                    value={form.specialty}
                    onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                    placeholder="Ej. Médico radiólogo"
                    className={inputClass}
                  />
                </Field>
                <Field label="Firma / sello">
                  <input
                    value={form.signatureLabel}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, signatureLabel: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Horario de atención" className="sm:col-span-2">
                  <input
                    value={form.scheduleNotes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, scheduleNotes: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <p className="sm:col-span-2 text-xs text-clinic-teal">
                  Puede crear asistentes: sí (por defecto al registrar médicos activos)
                </p>
              </>
            )}

            {effectiveRole === 'assistant' && (
              <>
                <Field label="Cargo *">
                  <input
                    required
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Médico asociado *">
                  <select
                    required
                    disabled={isDoctor}
                    value={form.associatedDoctorId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, associatedDoctorId: e.target.value }))
                    }
                    className={`${inputClass} disabled:bg-clinic-bg/60`}
                  >
                    <option value="">Seleccionar médico</option>
                    {doctorOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Área de apoyo" className="sm:col-span-2">
                  <input
                    value={form.supportArea}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, supportArea: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                {isDoctor && (
                  <p className="sm:col-span-2 text-xs text-clinic-text/60">
                    El asistente quedará asociado automáticamente a su usuario médico.
                  </p>
                )}
              </>
            )}

            {mode === 'create' && (
              <>
                <Field label="Contraseña temporal *">
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Confirmar contraseña *">
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
              </>
            )}

            <Field label="Observaciones" className="sm:col-span-2">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className={`${inputClass} resize-y`}
              />
            </Field>
          </div>

          {error && (
            <p className="mx-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {saved && (
            <p className="mx-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {mode === 'create'
                ? 'Usuario registrado correctamente.'
                : 'Cambios guardados correctamente.'}
            </p>
          )}

          <footer className="flex gap-3 border-t border-clinic-sky/60 p-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-clinic-sky py-2.5 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white"
            >
              <Save className="h-4 w-4" />
              Guardar usuario
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-clinic-deep-blue">{label}</span>
      {children}
    </label>
  )
}
