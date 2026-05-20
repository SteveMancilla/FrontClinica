import clsx from 'clsx'
import { Eye } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import type { DoctorProductivitySummary } from '@/types/medical'
import { getPatientInitials } from '@/utils/patientCatalog'

interface DoctorProductivityTableProps {
  rows: DoctorProductivitySummary[]
  topConcludedDoctorId: string | null
  topPendingDoctorId: string | null
  highlightDoctorId?: string | null
  onViewDetail: (row: DoctorProductivitySummary) => void
}

export default function DoctorProductivityTable({
  rows,
  topConcludedDoctorId,
  topPendingDoctorId,
  highlightDoctorId,
  onViewDetail,
}: DoctorProductivityTableProps) {
  if (rows.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm">
      <div className="border-b border-clinic-sky/60 px-4 py-3">
        <h2 className="font-semibold text-clinic-deep-blue">Productividad por médico</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead>
            <tr className="border-b border-clinic-sky/60 bg-clinic-bg/50">
              {[
                'Médico',
                'Especialidad',
                'Pacientes',
                'Estudios',
                'Informes',
                'Falta informe',
                'Falta impresión',
                'En revisión',
                'Concluidos',
                'PDF',
                'Estudios principales',
                'Última actividad',
                'Acción',
              ].map((h) => (
                <th key={h} className="px-3 py-2.5 font-semibold text-clinic-deep-blue">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-clinic-sky/40">
            {rows.map((row) => {
              const isTopConcluded = row.doctorId === topConcludedDoctorId
              const isTopPending = row.doctorId === topPendingDoctorId
              const isSelf = highlightDoctorId != null && row.doctorId === highlightDoctorId

              return (
                <tr
                  key={row.doctorId}
                  className={clsx(
                    'hover:bg-clinic-bg/30',
                    isSelf && 'bg-clinic-sky/30 ring-1 ring-inset ring-clinic-blue/25',
                    isTopConcluded && !isSelf && 'bg-emerald-50/40',
                    isTopPending && !isTopConcluded && !isSelf && 'bg-amber-50/40',
                  )}
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-clinic-blue/10 text-xs font-bold text-clinic-blue">
                        {getPatientInitials(row.doctorName.replace(/^(Dr\.|Dra\.)\s*/i, ''))}
                      </span>
                      <div>
                        <p className="font-medium text-clinic-deep-blue">{row.doctorName}</p>
                        {isSelf && (
                          <span className="text-[10px] font-medium text-clinic-blue">
                            Tu productividad
                          </span>
                        )}
                        {isTopConcluded && (
                          <span className="text-[10px] text-emerald-700">
                            Mayor avance en informes
                          </span>
                        )}
                        {isTopPending && !isTopConcluded && (
                          <span className="text-[10px] text-amber-700">
                            Más informes pendientes
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">{row.specialty}</td>
                  <td className="px-3 py-3 text-center">{row.totalPatients}</td>
                  <td className="px-3 py-3 text-center">{row.totalStudies}</td>
                  <td className="px-3 py-3 text-center font-medium">{row.totalReports}</td>
                  <td className="px-3 py-3 text-center">
                    <MetricBadge value={row.missingReports} variant="warning" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <MetricBadge value={row.missingDiagnosticImpression} variant="danger" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <MetricBadge value={row.inReview} variant="purple" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <MetricBadge value={row.concluded} variant="success" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <MetricBadge value={row.pdfGenerated} variant="teal" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                      {row.mainStudies.length === 0 ? (
                        <span className="text-xs text-clinic-text/50">—</span>
                      ) : (
                        row.mainStudies.map((study) => (
                          <span
                            key={study}
                            className="rounded-full bg-clinic-bg px-2 py-0.5 text-[10px] text-clinic-text"
                          >
                            {study}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-clinic-text/70">
                    {row.lastActivityDate ?? '—'}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onViewDetail(row)}
                      className="inline-flex items-center gap-1 rounded-lg border border-clinic-sky px-2.5 py-1.5 text-xs font-medium hover:bg-clinic-bg"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver detalle
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function MetricBadge({
  value,
  variant,
}: {
  value: number
  variant: 'warning' | 'danger' | 'purple' | 'success' | 'teal'
}) {
  if (value === 0) return <span className="text-clinic-text/40">0</span>
  return <StatusBadge label={String(value)} variant={variant} />
}
