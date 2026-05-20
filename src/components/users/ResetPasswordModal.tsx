import { useState, type FormEvent } from 'react'
import { KeyRound, Loader2, X } from 'lucide-react'
import type { SystemUser } from '@/types/auth'

interface ResetPasswordModalProps {
  isOpen: boolean
  user: SystemUser | null
  onClose: () => void
  onConfirm: (password: string) => Promise<void>
}

export default function ResetPasswordModal({
  isOpen,
  user,
  onClose,
  onConfirm,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !user) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(password)
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la contraseña.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setConfirm('')
    setSuccess(false)
    setError(null)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-clinic-deep-blue/40"
        onClick={handleClose}
        aria-label="Cerrar"
      />
      <div className="fixed top-1/2 left-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-clinic-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinic-blue/10 text-clinic-blue">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-clinic-deep-blue">Restablecer contraseña</h3>
              <p className="text-sm text-clinic-text/60">{user.fullName}</p>
              <p className="text-xs text-clinic-text/50">{user.email}</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} aria-label="Cerrar modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              La contraseña de <strong>{user.fullName}</strong> fue actualizada. El usuario
              podrá iniciar sesión con la nueva contraseña de inmediato.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <p className="text-sm text-clinic-text/70">
              Define una contraseña nueva para este usuario. Compártela de forma segura.
            </p>
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Nueva contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Confirmar contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-clinic-sky py-2.5 text-sm disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar contraseña
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
