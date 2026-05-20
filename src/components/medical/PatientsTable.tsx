import { type ReactNode } from 'react'
import { CalendarPlus, ClipboardList, Eye } from 'lucide-react'
import PatientStatusBadge from '@/components/medical/PatientStatusBadge'
import type { Appointment, MedicalReport, Patient, Study } from '@/types/medical'
import { findStudyById } from '@/data/mockMedical'
import {
  getLastAppointmentForPatient,
  getPatientInitials,
  getPatientReportsSummaryStatus,
} from '@/utils/patientCatalog'

interface PatientsTableProps {
  patients: Patient[]
  appointments: Appointment[]
  reports: MedicalReport[]
  studies?: Study[]
  canCreateAppointment: boolean
  onViewChart: (patient: Patient) => void
  onNewAppointment: (patient: Patient) => void
  onViewReports: (patient: Patient) => void
}

export default function PatientsTable({
  patients,
  appointments,
  reports,
  studies = [],
  canCreateAppointment,
  onViewChart,
  onNewAppointment,
  onViewReports,
}: PatientsTableProps) {
  if (patients.length === 0) {
    return (
      <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white px-6 py-12 text-center text-sm text-clinic-text/60">
        No hay pacientes que coincidan con los filtros.
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-clinic-sky/60 bg-clinic-bg/60">
                {[
                  'Paciente',
                  'DNI',
                  'Edad / sexo',
                  'Celular',
                  'Procedencia',
                  'Última atención',
                  'Estado de informes',
                  'Acciones',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold text-clinic-deep-blue">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-clinic-sky/40">
              {patients.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  appointments={appointments}
                  reports={reports}
                  studies={studies}
                  canCreateAppointment={canCreateAppointment}
                  onViewChart={onViewChart}
                  onNewAppointment={onNewAppointment}
                  onViewReports={onViewReports}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            appointments={appointments}
            reports={reports}
            studies={studies}
            canCreateAppointment={canCreateAppointment}
            onViewChart={onViewChart}
            onNewAppointment={onNewAppointment}
            onViewReports={onViewReports}
          />
        ))}
      </div>
    </>
  )
}

function resolveStudyName(studyId: string, studies: Study[]): string | undefined {
  return studies.find((s) => s.id === studyId)?.name ?? findStudyById(studyId)?.name
}

function PatientRow({
  patient,
  appointments,
  reports,
  studies,
  canCreateAppointment,
  onViewChart,
  onNewAppointment,
  onViewReports,
}: {
  patient: Patient
  appointments: Appointment[]
  reports: MedicalReport[]
  studies: Study[]
  canCreateAppointment: boolean
  onViewChart: (p: Patient) => void
  onNewAppointment: (p: Patient) => void
  onViewReports: (p: Patient) => void
}) {
  const summaryStatus = getPatientReportsSummaryStatus(
    patient.id,
    appointments,
    reports,
  )
  const lastApt = getLastAppointmentForPatient(patient.id, appointments)
  const lastStudyName = lastApt ? resolveStudyName(lastApt.studyId, studies) : undefined

  return (
    <tr className="hover:bg-clinic-bg/40">
      <td className="px-4 py-3">
        <PatientCell patient={patient} />
      </td>
      <td className="px-4 py-3 font-mono text-xs">{patient.dni}</td>
      <td className="px-4 py-3 text-clinic-text">
        {patient.age} años · {patient.sex}
      </td>
      <td className="px-4 py-3">{patient.phone}</td>
      <td className="px-4 py-3">{patient.origin}</td>
      <td className="px-4 py-3 text-xs text-clinic-text/80">
        {lastApt ? (
          <>
            <span className="block font-medium text-clinic-deep-blue">
              {lastStudyName ?? 'Estudio'}
            </span>
            {lastApt.appointmentDate} {lastApt.appointmentTime}
          </>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3">
        <PatientStatusBadge status={summaryStatus} />
      </td>
      <td className="px-4 py-3">
        <RowActions
          canCreateAppointment={canCreateAppointment}
          onViewChart={() => onViewChart(patient)}
          onNewAppointment={() => onNewAppointment(patient)}
          onViewReports={() => onViewReports(patient)}
        />
      </td>
    </tr>
  )
}

function PatientCard(props: Parameters<typeof PatientRow>[0]) {
  const { patient, appointments, reports } = props
  const summaryStatus = getPatientReportsSummaryStatus(
    patient.id,
    appointments,
    reports,
  )

  return (
    <article className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <PatientCell patient={patient} />
        <PatientStatusBadge status={summaryStatus} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-clinic-text/80">
        <div>
          <dt className="text-clinic-text/50">DNI</dt>
          <dd className="font-mono">{patient.dni}</dd>
        </div>
        <div>
          <dt className="text-clinic-text/50">Celular</dt>
          <dd>{patient.phone}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-clinic-text/50">Procedencia</dt>
          <dd>{patient.origin}</dd>
        </div>
      </dl>
      <div className="mt-3 border-t border-clinic-sky/40 pt-3">
        <RowActions
          canCreateAppointment={props.canCreateAppointment}
          onViewChart={() => props.onViewChart(patient)}
          onNewAppointment={() => props.onNewAppointment(patient)}
          onViewReports={() => props.onViewReports(patient)}
        />
      </div>
    </article>
  )
}

function PatientCell({ patient }: { patient: Patient }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clinic-teal/15 text-sm font-bold text-clinic-teal">
        {getPatientInitials(patient.fullName)}
      </span>
      <div>
        <p className="font-medium text-clinic-deep-blue">{patient.fullName}</p>
        {patient.status === 'inactive' && (
          <span className="text-[10px] text-clinic-text/50">Inactivo</span>
        )}
      </div>
    </div>
  )
}

function RowActions({
  canCreateAppointment,
  onViewChart,
  onNewAppointment,
  onViewReports,
}: {
  canCreateAppointment: boolean
  onViewChart: () => void
  onNewAppointment: () => void
  onViewReports: () => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <ActionBtn title="Ver ficha" onClick={onViewChart}>
        <Eye className="h-4 w-4" />
      </ActionBtn>
      {canCreateAppointment && (
        <ActionBtn title="Nueva atención" onClick={onNewAppointment}>
          <CalendarPlus className="h-4 w-4" />
        </ActionBtn>
      )}
      <ActionBtn title="Ver informes" onClick={onViewReports}>
        <ClipboardList className="h-4 w-4" />
      </ActionBtn>
    </div>
  )
}

function ActionBtn({
  children,
  onClick,
  title,
}: {
  children: ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg p-2 text-clinic-text/60 hover:bg-clinic-bg hover:text-clinic-blue"
    >
      {children}
    </button>
  )
}
