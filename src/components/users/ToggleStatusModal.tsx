import { X } from 'lucide-react'
import type { SystemUser } from '@/types/auth'

interface ToggleStatusModalProps {
  isOpen: boolean
  user: SystemUser | null
  onClose: () => void
  onConfirm: () => void
}

export default function ToggleStatusModal({
  isOpen,
  user,
  onClose,
  onConfirm,
}: ToggleStatusModalProps) {
  if (!isOpen || !user) return null

  const activating = user.status === 'inactive'

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-clinic-deep-blue/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="fixed top-1/2 left-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-clinic-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-clinic-deep-blue">
            {activating ? '¿Deseas activar este usuario?' : '¿Deseas desactivar este usuario?'}
          </h3>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-clinic-text/70">
          {activating
            ? 'El usuario podrá volver a ingresar al sistema.'
            : 'El usuario no podrá ingresar al sistema mientras esté inactivo.'}
        </p>
        <p className="mt-2 text-sm font-medium text-clinic-deep-blue">{user.fullName}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-clinic-sky py-2.5 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-clinic-white ${
              activating ? 'bg-clinic-teal hover:opacity-90' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </>
  )
}
