import { Link } from 'react-router-dom'
import ReportStatusBadge from '@/components/medical/ReportStatusBadge'
import type { DashboardReportRow } from '@/utils/dashboard'
import { formatReportUpdatedAt, getReportActionLabel } from '@/utils/reportStatus'

interface PendingReportsListProps {
  reports: DashboardReportRow[]
  emptyMessage?: string
  showDoctor?: boolean
}

export default function PendingReportsList({
  reports,
  emptyMessage = 'No tienes informes pendientes por el momento.',
  showDoctor = true,
}: PendingReportsListProps) {
  if (reports.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-clinic-sky/60 bg-clinic-bg/40 px-4 py-8 text-center text-sm text-clinic-text/60">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-clinic-sky/50 text-xs uppercase text-clinic-text/50">
            <th className="px-3 py-2">Paciente</th>
            {showDoctor && <th className="px-3 py-2">Médico</th>}
            <th className="px-3 py-2">Estudio</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Actualización</th>
            <th className="px-3 py-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((row) => (
            <tr key={row.reportId} className="border-b border-clinic-sky/30 last:border-0 hover:bg-clinic-bg/40">
              <td className="px-3 py-2.5">
                <p className="font-medium text-clinic-text">{row.patientName}</p>
                {row.dni && <p className="text-xs text-clinic-text/50">DNI {row.dni}</p>}
              </td>
              {showDoctor && (
                <td className="px-3 py-2.5 text-clinic-text/80">{row.doctorName}</td>
              )}
              <td className="px-3 py-2.5">{row.studyName}</td>
              <td className="px-3 py-2.5">
                <ReportStatusBadge status={row.status} />
              </td>
              <td className="px-3 py-2.5 text-xs text-clinic-text/60">
                {formatReportUpdatedAt(row.updatedAt)}
              </td>
              <td className="px-3 py-2.5">
                <Link
                  to={`/reports/new?reportId=${row.reportId}`}
                  className="text-sm font-medium text-clinic-blue hover:underline"
                >
                  {getReportActionLabel(row.status)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
