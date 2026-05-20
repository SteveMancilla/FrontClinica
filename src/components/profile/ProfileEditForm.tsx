import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Save, UserPen } from 'lucide-react'
import { ApiError, formatApiErrorMessage } from '@/services/apiClient'
import { updateProfile, type ProfileUpdateInput } from '@/services/authService'
import type { SystemUser, UserRole } from '@/types/auth'

const inputClass =
  'mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm focus:border-clinic-blue focus:outline-none focus:ring-1 focus:ring-clinic-blue'

interface ProfileEditFormProps {
  profile: SystemUser
  role: UserRole
  onUpdated: (profile: SystemUser) => void
}

function buildInitial(profile: SystemUser): ProfileUpdateInput {
  return {
    fullName: profile.fullName,
    email: profile.email,
    dni: profile.dni ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    specialty: profile.specialty ?? '',
    position: profile.position ?? '',
    supportArea: profile.supportArea ?? '',
    notes: profile.notes ?? '',
  }
}

export default function ProfileEditForm({ profile, role, onUpdated }: ProfileEditFormProps) {
  const [form, setForm] = useState<ProfileUpdateInput>(() => buildInitial(profile))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setForm(buildInitial(profile))
    setError(null)
    setSuccess(null)
  }, [profile])

  const set = <K extends keyof ProfileUpdateInput>(key: K, value: ProfileUpdateInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.fullName.trim()) {
      setError('El nombre completo es obligatorio.')
      return
    }
    if (!form.email.trim()) {
      setError('El correo es obligatorio.')
      return
    }

    setIsSubmitting(true)
    try {
      const updated = await updateProfile(form)
      onUpdated(updated)
      setSuccess('Tus datos se guardaron correctamente.')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? formatApiErrorMessage(err)
          : 'No se pudo actualizar el perfil.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const showMedicalFields = role === 'doctor'
  const showAssistantFields = role === 'assistant'

  return (
    <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clinic-teal/10 text-clinic-teal">
          <UserPen className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-clinic-deep-blue">Datos personales</h2>
          <p className="mt-1 text-sm text-clinic-text/70">
            Actualiza tu información de contacto y profesional. El rol y el estado los gestiona
            el administrador.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-clinic-deep-blue">Nombre completo</span>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-deep-blue">Correo electrónico</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-deep-blue">DNI</span>
            <input
              type="text"
              value={form.dni}
              onChange={(e) => set('dni', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-deep-blue">Celular</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-clinic-deep-blue">Dirección</span>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {showMedicalFields && (
          <div className="grid gap-4 border-t border-clinic-sky/40 pt-4 sm:grid-cols-2">
            <p className="text-sm font-semibold text-clinic-deep-blue sm:col-span-2">
              Datos profesionales (médico)
            </p>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-clinic-deep-blue">Especialidad / cargo</span>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) => set('specialty', e.target.value)}
                className={inputClass}
                placeholder="Ej. Médico radiólogo"
              />
            </label>
          </div>
        )}

        {showAssistantFields && (
          <div className="grid gap-4 border-t border-clinic-sky/40 pt-4 sm:grid-cols-2">
            <p className="text-sm font-semibold text-clinic-deep-blue sm:col-span-2">
              Datos profesionales (asistente)
            </p>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-clinic-deep-blue">Cargo</span>
              <input
                type="text"
                value={form.position}
                onChange={(e) => set('position', e.target.value)}
                className={inputClass}
                placeholder="Ej. Asistente médico"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-clinic-deep-blue">Área de apoyo</span>
              <input
                type="text"
                value={form.supportArea}
                onChange={(e) => set('supportArea', e.target.value)}
                className={inputClass}
                placeholder="Ej. Ecografía, recepción de informes"
              />
            </label>
          </div>
        )}

        {role === 'admin' && (
          <div className="space-y-4 border-t border-clinic-sky/40 pt-4">
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Especialidad / cargo en informes</span>
              <input
                type="text"
                value={form.position}
                onChange={(e) => set('position', e.target.value)}
                className={inputClass}
                placeholder="Ej. Administrador · Médico radiólogo"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Notas internas</span>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        )}

        {profile.associatedDoctorName && (
          <p className="rounded-lg bg-clinic-bg/80 px-3 py-2 text-sm text-clinic-text/70">
            <span className="font-medium text-clinic-deep-blue">Médico asociado:</span>{' '}
            {profile.associatedDoctorName} (solo el administrador puede cambiarlo)
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-5 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar cambios
        </button>
      </form>
    </section>
  )
}
