import { type ReactNode } from 'react'
import {
  CalendarPlus,
  ClipboardList,
  FileText,
  Pencil,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PatientHistoryTable from '@/components/medical/PatientHistoryTable'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Appointment, MedicalReport, Patient } from '@/types/medical'
import {
  findDoctorById,
  findStudyById,
} from '@/data/mockMedical'
import {
  getPatientDetailSummary,
  getPatientInitials,
} from '@/utils/patientCatalog'
import {
  getReportStatusLabel,
  getReportStatusVariant,
} from '@/utils/reportStatus'

interface PatientDetailDrawerProps {
  isOpen: boolean
  patient: Patient | null
  appointments: Appointment[]
  reports: MedicalReport[]
  canEdit: boolean
  canCreateAppointment: boolean
  onClose: () => void
  onEdit: () => void
  onNewAppointment: () => void
}

export default function PatientDetailDrawer({
  isOpen,
  patient,
  appointments,
  reports,
  canEdit,
  canCreateAppointment,
  onClose,
  onEdit,
  onNewAppointment,
}: PatientDetailDrawerProps) {
  if (!isOpen || !patient) return null

  const patientAppointments = appointments.filter((a) => a.patientId === patient.id)
  const patientReports = reports.filter((r) => r.patientId === patient.id)
  const summary = getPatientDetailSummary(patient.id, appointments, reports)
  const lastDoctor = summary.lastAppointment
    ? findDoctorById(summary.lastAppointment.doctorId)
    : undefined
  const lastStudy = summary.lastAppointment
    ? findStudyById(summary.lastAppointment.studyId)
    : undefined

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-clinic-deep-blue/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-full flex-col overflow-hidden bg-clinic-white shadow-2xl sm:max-w-3xl lg:max-w-4xl">
        <header className="shrink-0 border-b border-clinic-sky/60 bg-clinic-white px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-clinic-teal/15 text-base font-bold text-clinic-teal sm:h-14 sm:w-14 sm:text-lg">
                {getPatientInitials(patient.fullName)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-clinic-deep-blue sm:text-xl">
                  {patient.fullName}
                </h2>
                <p className="text-sm text-clinic-text/70">
                  DNI {patient.dni} · {patient.age} años · {patient.sex}
                </p>
                <p className="truncate text-sm">
                  {patient.phone} · {patient.origin}
                </p>
                <div className="mt-2">
                  <StatusBadge
                    label={patient.status === 'inactive' ? 'Inactivo' : 'Activo'}
                    variant={patient.status === 'inactive' ? 'neutral' : 'success'}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-clinic-text/60 hover:bg-clinic-bg"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {canCreateAppointment && (
              <HeaderAction onClick={onNewAppointment}>
                <CalendarPlus className="h-4 w-4" />
                Nueva atención
              </HeaderAction>
            )}
            <HeaderAction as={Link} to={`/reports?patientId=${patient.id}`}>
              <ClipboardList className="h-4 w-4" />
              Ver informes
            </HeaderAction>
            {canEdit && (
              <HeaderAction onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                Editar datos
              </HeaderAction>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-clinic-bg/40 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
                <h3 className="font-semibold text-clinic-deep-blue">Datos personales</h3>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <DataItem label="DNI" value={patient.dni} />
                  <DataItem label="Nombre completo" value={patient.fullName} />
                  <DataItem label="Edad" value={`${patient.age} años`} />
                  <DataItem label="Sexo" value={patient.sex} />
                  <DataItem label="Celular" value={patient.phone} />
                  <DataItem label="Dirección" value={patient.address ?? '—'} />
                  <DataItem label="Correo" value={patient.email ?? '—'} />
                  <DataItem label="Procedencia" value={patient.origin} />
                  <DataItem
                    label="Fecha de registro"
                    value={new Date(patient.createdAt).toLocaleDateString('es-PE')}
                  />
                  <DataItem
                    label="Contacto de emergencia"
                    value={patient.emergencyContactName ?? '—'}
                  />
                  <DataItem
                    label="Tel. emergencia"
                    value={patient.emergencyContactPhone ?? '—'}
                  />
                  <DataItem
                    label="Observaciones"
                    value={patient.notes ?? '—'}
                    className="sm:col-span-2"
                  />
                </dl>
              </section>

              <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
                <h3 className="font-semibold text-clinic-deep-blue">
                  Historial de estudios
                </h3>
                <div className="mt-3">
                  {patientAppointments.length === 0 ? (
                    <div className="text-center">
                      <p className="text-sm text-clinic-text/60">
                        Este paciente aún no tiene estudios registrados.
                      </p>
                      {canCreateAppointment && (
                        <button
                          type="button"
                          onClick={onNewAppointment}
                          className="mt-3 rounded-lg bg-clinic-teal px-4 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-teal/90"
                        >
                          Crear primera atención
                        </button>
                      )}
                    </div>
                  ) : (
                    <PatientHistoryTable appointments={patientAppointments} />
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
                <h3 className="font-semibold text-clinic-deep-blue">Informes asociados</h3>
                {patientReports.length === 0 ? (
                  <p className="mt-3 text-sm text-clinic-text/60">
                    Este paciente aún no tiene informes médicos asociados.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {patientReports.map((report) => {
                      const study = findStudyById(report.studyId)
                      const doctor = findDoctorById(report.doctorId)
                      return (
                        <li
                          key={report.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-clinic-sky/40 bg-clinic-bg/30 px-3 py-2.5 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-clinic-deep-blue">
                              {study?.name ?? report.studyId}
                            </p>
                            <p className="text-xs text-clinic-text/60">
                              {doctor?.fullName} · {report.reportDate}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge
                              label={getReportStatusLabel(report.status)}
                              variant={getReportStatusVariant(report.status)}
                            />
                            <Link
                              to={`/reports/new?reportId=${report.id}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-clinic-blue px-2.5 py-1.5 text-xs font-medium text-clinic-white"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Abrir
                            </Link>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </div>

            <aside className="space-y-3">
              <SummaryBox title="Resumen del paciente" value={summary.totalStudies} subtitle="Estudios totales" />
              <SummaryBox
                title="Informes pendientes"
                value={summary.pendingReports}
                accent="warning"
              />
              <SummaryBox
                title="Informes concluidos"
                value={summary.concludedReports}
                accent="success"
              />
              <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 text-sm shadow-sm">
                <p className="text-xs font-medium text-clinic-text/50">Último estudio</p>
                <p className="mt-1 font-medium text-clinic-deep-blue">
                  {lastStudy?.name ?? '—'}
                </p>
                <p className="mt-3 text-xs font-medium text-clinic-text/50">
                  Último médico responsable
                </p>
                <p className="mt-1 text-clinic-text">{lastDoctor?.fullName ?? '—'}</p>
              </div>
            </aside>
          </div>
        </div>
      </aside>
    </>
  )
}

function DataItem({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-clinic-text/50">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-clinic-deep-blue">{value}</dd>
    </div>
  )
}

function SummaryBox({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string
  value: number
  subtitle?: string
  accent?: 'warning' | 'success'
}) {
  const valueClass =
    accent === 'warning'
      ? 'text-amber-600'
      : accent === 'success'
        ? 'text-emerald-600'
        : 'text-clinic-deep-blue'

  return (
    <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
      <p className="text-xs text-clinic-text/50">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-clinic-text/50">{subtitle}</p>}
    </div>
  )
}

function HeaderAction({
  children,
  onClick,
  as: Component = 'button',
  to,
}: {
  children: ReactNode
  onClick?: () => void
  as?: 'button' | typeof Link
  to?: string
}) {
  const className =
    'inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky bg-clinic-white px-3 py-2 text-xs font-medium text-clinic-text hover:bg-clinic-bg'

  if (Component === Link && to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}
