import { FileText, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import OriginDistribution from '@/components/medical/OriginDistribution'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  findPatientById,
  findStudyById,
} from '@/data/mockMedical'
import type {
  Appointment,
  DoctorProductivitySummary,
  MedicalReport,
  OriginProductivitySummary,
  StudyProductivitySummary,
} from '@/types/medical'
import { getPatientInitials } from '@/utils/patientCatalog'
import {
  getReportStatusLabel,
  getReportStatusVariant,
} from '@/utils/reportStatus'

interface DoctorProductivityDrawerProps {
  isOpen: boolean
  doctor: DoctorProductivitySummary | null
  studyRows: StudyProductivitySummary[]
  originRows: OriginProductivitySummary[]
  recentAppointments: Appointment[]
  recentReports: MedicalReport[]
  onClose: () => void
}

export default function DoctorProductivityDrawer({
  isOpen,
  doctor,
  studyRows,
  originRows,
  recentAppointments,
  recentReports,
  onClose,
}: DoctorProductivityDrawerProps) {
  if (!isOpen || !doctor) return null

  const pending =
    doctor.missingReports + doctor.missingDiagnosticImpression + doctor.inReview

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-clinic-deep-blue/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-clinic-bg shadow-2xl">
        <header className="border-b border-clinic-sky/60 bg-clinic-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-clinic-blue/10 text-sm font-bold text-clinic-blue">
                {getPatientInitials(doctor.doctorName.replace(/^(Dr\.|Dra\.)\s*/i, ''))}
              </span>
              <div>
                <h2 className="text-lg font-bold text-clinic-deep-blue">
                  Detalle de productividad médica
                </h2>
                <p className="font-medium">{doctor.doctorName}</p>
                <p className="text-sm text-clinic-text/70">{doctor.specialty}</p>
                {(doctor.cmp || doctor.rne) && (
                  <p className="text-xs text-clinic-text/50">
                    {[doctor.cmp, doctor.rne].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-clinic-bg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Pacientes" value={doctor.totalPatients} />
            <Stat label="Estudios" value={doctor.totalStudies} />
            <Stat label="Informes" value={doctor.totalReports} />
            <Stat label="Pendientes" value={pending} accent="warning" />
            <Stat label="Concluidos" value={doctor.concluded} accent="success" />
            <Stat label="PDF generados" value={doctor.pdfGenerated} accent="teal" />
            <Stat
              label="Promedio informes/día"
              value={doctor.averageReportsPerDay ?? 0}
            />
            <Stat label="Última actividad" value={doctor.lastActivityDate ?? '—'} text />
          </div>

          <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
            <h3 className="font-semibold text-clinic-deep-blue">Estudios realizados</h3>
            {studyRows.length === 0 ? (
              <p className="mt-3 text-sm text-clinic-text/60">Sin estudios en el periodo.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-clinic-sky/50 text-left">
                      <th className="py-2 font-medium">Estudio</th>
                      <th className="py-2 font-medium">Cantidad</th>
                      <th className="py-2 font-medium">Concluidos</th>
                      <th className="py-2 font-medium">Pendientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studyRows.map((row) => (
                      <tr key={row.studyId} className="border-b border-clinic-sky/30">
                        <td className="py-2">{row.studyName}</td>
                        <td className="py-2">{row.total}</td>
                        <td className="py-2 text-emerald-700">{row.concluded}</td>
                        <td className="py-2 text-amber-700">{row.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
            <h3 className="font-semibold text-clinic-deep-blue">Últimos informes</h3>
            {recentReports.length === 0 ? (
              <p className="mt-3 text-sm text-clinic-text/60">Sin informes recientes.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-clinic-sky/50 text-left">
                      <th className="py-2 font-medium">Fecha</th>
                      <th className="py-2 font-medium">Paciente</th>
                      <th className="py-2 font-medium">Estudio</th>
                      <th className="py-2 font-medium">Estado</th>
                      <th className="py-2 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map((report) => {
                      const patient = findPatientById(report.patientId)
                      const study = findStudyById(report.studyId)
                      return (
                        <tr key={report.id} className="border-b border-clinic-sky/30">
                          <td className="py-2 whitespace-nowrap">{report.reportDate}</td>
                          <td className="py-2">{patient?.fullName ?? '—'}</td>
                          <td className="py-2">{study?.name ?? report.studyId}</td>
                          <td className="py-2">
                            <StatusBadge
                              label={getReportStatusLabel(report.status)}
                              variant={getReportStatusVariant(report.status)}
                            />
                          </td>
                          <td className="py-2">
                            <Link
                              to={`/reports/new?reportId=${report.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-clinic-blue"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Abrir
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-clinic-deep-blue">Procedencia</h3>
            {originRows.length === 0 ? (
              <p className="text-sm text-clinic-text/60">Sin datos de procedencia.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originRows.map((o) => (
                  <span
                    key={o.origin}
                    className="rounded-full border border-clinic-sky bg-clinic-bg px-3 py-1 text-xs"
                  >
                    {o.origin}: <strong>{o.total}</strong>
                  </span>
                ))}
              </div>
            )}
          </section>

          {recentAppointments.length > 0 && (
            <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
              <h3 className="font-semibold text-clinic-deep-blue">Últimas atenciones</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {recentAppointments.map((apt) => {
                  const study = findStudyById(apt.studyId)
                  const patient = findPatientById(apt.patientId)
                  return (
                    <li
                      key={apt.id}
                      className="flex justify-between gap-2 rounded-lg bg-clinic-bg/40 px-3 py-2"
                    >
                      <span>
                        {apt.appointmentDate} — {study?.name}
                        <span className="block text-xs text-clinic-text/60">
                          {patient?.fullName}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {originRows.length > 0 && (
            <OriginDistribution items={originRows} />
          )}
        </div>
      </aside>
    </>
  )
}

function Stat({
  label,
  value,
  accent,
  text,
}: {
  label: string
  value: number | string
  accent?: 'warning' | 'success' | 'teal'
  text?: boolean
}) {
  const valueClass =
    accent === 'warning'
      ? 'text-amber-600'
      : accent === 'success'
        ? 'text-emerald-600'
        : accent === 'teal'
          ? 'text-teal-700'
          : 'text-clinic-deep-blue'

  return (
    <div className="rounded-lg border border-clinic-sky/40 bg-clinic-white p-3 shadow-sm">
      <p className="text-xs text-clinic-text/50">{label}</p>
      <p className={`mt-1 font-bold ${text ? 'text-sm' : 'text-2xl'} ${valueClass}`}>
        {value}
      </p>
    </div>
  )
}
