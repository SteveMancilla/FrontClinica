import { ExternalLink, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Appointment } from '@/types/medical'
import {
  findDoctorById,
  findSpecialtyById,
  findStudyById,
} from '@/data/mockMedical'
import {
  getAppointmentStatusLabel,
  getAppointmentStatusVariant,
} from '@/utils/appointmentStatus'

interface PatientHistoryTableProps {
  appointments: Appointment[]
}

export default function PatientHistoryTable({
  appointments,
}: PatientHistoryTableProps) {
  const sorted = [...appointments].sort((a, b) => {
    const da = `${a.appointmentDate}T${a.appointmentTime}`
    const db = `${b.appointmentDate}T${b.appointmentTime}`
    return db.localeCompare(da)
  })

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-clinic-sky/60 bg-clinic-bg/30 px-4 py-8 text-center text-sm text-clinic-text/60">
        Este paciente aún no tiene estudios registrados.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-clinic-sky/50">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-clinic-sky/60 bg-clinic-bg/50">
            {[
              'Fecha',
              'Estudio',
              'Especialidad',
              'Médico',
              'Procedencia',
              'Estado',
              'Acción',
            ].map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold text-clinic-deep-blue">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-clinic-sky/40">
          {sorted.map((apt) => {
            const study = findStudyById(apt.studyId)
            const specialty = findSpecialtyById(apt.specialtyId)
            const doctor = findDoctorById(apt.doctorId)
            const reportLink = `/reports/new?appointmentId=${apt.id}`

            return (
              <tr key={apt.id} className="hover:bg-clinic-bg/30">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {apt.appointmentDate}
                  <span className="block text-xs text-clinic-text/50">
                    {apt.appointmentTime}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-medium text-clinic-deep-blue">
                  {study?.name ?? apt.studyId}
                </td>
                <td className="px-3 py-2.5">{specialty?.name ?? '—'}</td>
                <td className="px-3 py-2.5">{doctor?.fullName ?? '—'}</td>
                <td className="px-3 py-2.5">{apt.origin}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge
                    label={getAppointmentStatusLabel(apt.status)}
                    variant={getAppointmentStatusVariant(apt.status)}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <Link
                      to={reportLink}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-clinic-blue hover:bg-clinic-bg"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Informe
                    </Link>
                    {apt.status === 'pdf_generated' && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-clinic-teal hover:bg-clinic-bg"
                        title="Ver PDF"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
