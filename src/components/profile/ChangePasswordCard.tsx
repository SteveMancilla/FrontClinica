import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { ApiError, formatApiErrorMessage } from '@/services/apiClient'
import { changePassword } from '@/services/authService'

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setCurrentPassword('')
    setPassword('')
    setPasswordConfirmation('')
    setShowCurrent(false)
    setShowNew(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== passwordConfirmation) {
      setError('La confirmación no coincide con la nueva contraseña.')
      return
    }
    if (currentPassword === password) {
      setError('La nueva contraseña debe ser distinta a la actual.')
      return
    }

    setIsSubmitting(true)
    try {
      await changePassword({
        currentPassword,
        password,
        passwordConfirmation,
      })
      resetForm()
      setSuccess('Tu contraseña se actualizó correctamente.')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(formatApiErrorMessage(err))
      } else {
        setError('No se pudo cambiar la contraseña. Intenta nuevamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clinic-blue/10 text-clinic-blue">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-clinic-deep-blue">Seguridad de la cuenta</h2>
          <p className="mt-1 text-sm text-clinic-text/70">
            Actualiza tu contraseña de acceso. Necesitas conocer la contraseña actual.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <PasswordField
          label="Contraseña actual"
          value={currentPassword}
          onChange={setCurrentPassword}
          visible={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
          autoComplete="current-password"
        />
        <PasswordField
          label="Nueva contraseña"
          value={password}
          onChange={setPassword}
          visible={showNew}
          onToggle={() => setShowNew((v) => !v)}
          autoComplete="new-password"
          hint="Mínimo 6 caracteres"
        />
        <PasswordField
          label="Confirmar nueva contraseña"
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          visible={showNew}
          onToggle={() => setShowNew((v) => !v)}
          autoComplete="new-password"
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {success && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-5 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Cambiar contraseña
        </button>
      </form>
    </section>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggle: () => void
  autoComplete: string
  hint?: string
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-clinic-deep-blue">{label}</span>
      {hint && <span className="ml-2 text-xs font-normal text-clinic-text/50">{hint}</span>}
      <div className="relative mt-1">
        <input
          type={visible ? 'text' : 'password'}
          required
          minLength={label.includes('Nueva') ? 6 : undefined}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-clinic-sky/80 py-2 pr-10 pl-3 text-sm"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-clinic-text/50 hover:text-clinic-deep-blue"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  )
}
