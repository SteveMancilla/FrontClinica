import { FileText } from 'lucide-react'
import { getPendingReportOptions } from '@/utils/reportDraft'
import { getReportStatusLabel } from '@/utils/reportStatus'
import type { ReportStatus } from '@/types/medical'

interface PendingReportSelectorProps {
  onSelect: (reportId: string) => void
}

export default function PendingReportSelector({
  onSelect,
}: PendingReportSelectorProps) {
  const options = getPendingReportOptions()

  return (
    <section className="mx-auto max-w-lg rounded-xl border border-clinic-sky/50 bg-clinic-white p-8 shadow-sm">
      <div className="text-center">
        <FileText className="mx-auto h-10 w-10 text-clinic-blue" />
        <h2 className="mt-4 text-xl font-bold text-clinic-deep-blue">
          Seleccionar atención pendiente
        </h2>
        <p className="mt-2 text-sm text-clinic-text/70">
          Elige un caso de la bandeja de informes para iniciar o continuar el
          dictado.
        </p>
      </div>

      {options.length === 0 ? (
        <p className="mt-6 text-center text-sm text-clinic-text/60">
          No hay informes pendientes en la simulación actual.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {options.map((opt) => (
            <li key={opt.reportId}>
              <button
                type="button"
                onClick={() => onSelect(opt.reportId)}
                className="w-full rounded-lg border border-clinic-sky/60 px-4 py-3 text-left transition hover:border-clinic-blue hover:bg-clinic-bg/50"
              >
                <span className="block text-sm font-medium text-clinic-deep-blue">
                  {opt.label}
                </span>
                <span className="mt-1 text-xs text-clinic-text/60">
                  {getReportStatusLabel(opt.status as ReportStatus)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
