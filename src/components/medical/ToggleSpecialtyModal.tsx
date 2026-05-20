import { X } from 'lucide-react'
import type { Specialty } from '@/types/medical'

interface ToggleSpecialtyModalProps {
  isOpen: boolean
  specialty: Specialty | null
  onClose: () => void
  onConfirm: () => void
}

export default function ToggleSpecialtyModal({
  isOpen,
  specialty,
  onClose,
  onConfirm,
}: ToggleSpecialtyModalProps) {
  if (!isOpen || !specialty) return null
  const activating = specialty.isActive === false

  return (
    <>
      <button type="button" className="fixed inset-0 z-[60] bg-clinic-deep-blue/40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-clinic-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-clinic-deep-blue">
            {activating ? '¿Deseas activar esta especialidad?' : '¿Deseas desactivar esta especialidad?'}
          </h3>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-3 text-sm text-clinic-text/70">
          {activating
            ? 'La especialidad volverá a estar disponible para médicos y estudios.'
            : 'Los estudios relacionados seguirán existiendo, pero la especialidad no aparecerá como opción activa en nuevos registros.'}
        </p>
        <p className="mt-2 font-medium text-clinic-deep-blue">{specialty.name}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border py-2.5 text-sm">Cancelar</button>
          <button type="button" onClick={() => { onConfirm(); onClose() }} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-clinic-white ${activating ? 'bg-clinic-teal' : 'bg-red-500'}`}>
            Confirmar
          </button>
        </div>
      </div>
    </>
  )
}
