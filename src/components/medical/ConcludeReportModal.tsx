import { X } from 'lucide-react'

interface ConcludeReportModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ConcludeReportModal({
  isOpen,
  onClose,
  onConfirm,
}: ConcludeReportModalProps) {
  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-clinic-deep-blue/50"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-clinic-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-clinic-deep-blue">
            Confirmar diagnóstico concluido
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-clinic-bg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-clinic-text/80">
          ¿Confirmas que revisaste y validaste este informe médico?
        </p>
        <p className="mt-2 text-xs text-clinic-text/60">
          Luego de concluirlo, quedará marcado como informe validado por el médico.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-clinic-sky py-2.5 text-sm font-medium text-clinic-text hover:bg-clinic-bg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
          >
            Confirmar diagnóstico concluido
          </button>
        </div>
      </div>
    </>
  )
}
