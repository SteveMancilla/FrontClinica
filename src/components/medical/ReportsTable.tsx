import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import ReportStatusBadge from '@/components/medical/ReportStatusBadge'
import { downloadMedicalReportPdf } from '@/services/medicalReportService'
import type { MedicalReport } from '@/types/medical'
import {
  formatReportUpdatedAt,
  getReportActionLabel,
  getReportRowClass,
} from '@/utils/reportStatus'

interface ReportsTableProps {
  reports: MedicalReport[]
}

export default function ReportsTable({ reports }: ReportsTableProps) {
  const navigate = useNavigate()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleEdit = (report: MedicalReport) => {
    navigate(`/reports/new?reportId=${report.id}`)
  }

  const handleDownload = async (report: MedicalReport) => {
    setDownloadingId(report.id)
    try {
      await downloadMedicalReportPdf(report.id, {
        regenerate: report.status !== 'pdf_generated' || !report.pdfPath,
      })
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'No se pudo descargar el PDF del informe.',
      )
    } finally {
      setDownloadingId(null)
    }
  }

  if (reports.length === 0) {
    return null
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-clinic-sky/60 bg-clinic-bg/60">
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  Fecha / hora
                </th>
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  Paciente
                </th>
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  DNI
                </th>
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  Edad / sexo
                </th>
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  Estudio
                </th>
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  Médico responsable
                </th>
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  Estado
                </th>
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  Última actualización
                </th>
                <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinic-sky/40">
              {reports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  onEdit={handleEdit}
                  onDownload={handleDownload}
                  variant="table"
                  isDownloading={downloadingId === report.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {reports.map((report) => (
          <ReportRow
            key={report.id}
            report={report}
            onEdit={handleEdit}
            onDownload={handleDownload}
            variant="card"
            isDownloading={downloadingId === report.id}
          />
        ))}
      </div>
    </>
  )
}

interface ReportRowProps {
  report: MedicalReport
  onEdit: (report: MedicalReport) => void
  onDownload: (report: MedicalReport) => void | Promise<void>
  variant: 'table' | 'card'
  isDownloading?: boolean
}

function ReportRow({
  report,
  onEdit,
  onDownload,
  variant,
  isDownloading,
}: ReportRowProps) {
  const patientName = report.patientFullName ?? report.patient?.fullName
  const patientDni = report.patientDni ?? report.patient?.dni
  const patientAge = report.patient?.age
  const patientSex = report.patient?.sex
  const studyName = report.studyName ?? report.study?.name
  const doctorName = report.doctorFullName ?? report.doctor?.fullName
  const rowClass = getReportRowClass(report.status)
  const actionLabel = getReportActionLabel(report.status)
  const showDownload =
    report.status === 'concluded' || report.status === 'pdf_generated'

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onEdit(report)}
        className="rounded-lg bg-clinic-blue px-3 py-1.5 text-xs font-semibold text-clinic-white transition hover:bg-clinic-deep-blue"
      >
        {showDownload ? 'Editar informe' : actionLabel}
      </button>
      {showDownload && (
        <button
          type="button"
          onClick={() => void onDownload(report)}
          disabled={isDownloading}
          className="rounded-lg border border-clinic-teal bg-clinic-teal/10 px-3 py-1.5 text-xs font-semibold text-clinic-teal hover:bg-clinic-teal/20 disabled:opacity-60"
        >
          {isDownloading ? 'Descargando…' : 'Descargar PDF'}
        </button>
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <article
        className={clsx(
          'rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm',
          rowClass,
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-clinic-deep-blue">
              {patientName ?? '—'}
            </p>
            <p className="text-xs text-clinic-text/60">
              DNI {patientDni ?? '—'} · {studyName ?? '—'}
            </p>
          </div>
          <ReportStatusBadge status={report.status} />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-clinic-text/80">
          <div>
            <dt className="text-clinic-text/50">Fecha</dt>
            <dd>
              {report.reportDate} {report.reportTime}
            </dd>
          </div>
          <div>
            <dt className="text-clinic-text/50">Médico</dt>
            <dd className="truncate">{doctorName ?? '—'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-clinic-text/50">Actualizado</dt>
            <dd>{formatReportUpdatedAt(report.updatedAt)}</dd>
          </div>
        </dl>
        <div className="mt-4">{actionButtons}</div>
      </article>
    )
  }

  return (
    <tr className={clsx('transition hover:bg-clinic-bg/30', rowClass)}>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-medium text-clinic-text">{report.reportDate}</span>
        <span className="block text-xs text-clinic-text/60">
          {report.reportTime}
        </span>
      </td>
      <td className="px-4 py-3 font-medium text-clinic-deep-blue">
        {patientName ?? '—'}
      </td>
      <td className="px-4 py-3 text-clinic-text">{patientDni ?? '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-clinic-text">
        {patientAge != null && patientSex
          ? `${patientAge} años · ${patientSex}`
          : '—'}
      </td>
      <td className="px-4 py-3 text-clinic-text">{studyName ?? '—'}</td>
      <td className="px-4 py-3 text-clinic-text">{doctorName ?? '—'}</td>
      <td className="px-4 py-3">
        <ReportStatusBadge status={report.status} />
      </td>
      <td className="px-4 py-3 text-xs text-clinic-text/70 whitespace-nowrap">
        {formatReportUpdatedAt(report.updatedAt)}
      </td>
      <td className="px-4 py-3">{actionButtons}</td>
    </tr>
  )
}
