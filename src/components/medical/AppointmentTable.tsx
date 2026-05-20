import { useNavigate } from 'react-router-dom'
import { Eye, FileText } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  findDoctorById,
  findPatientById,
  findStudyById,
} from '@/data/mockMedical'
import type { Appointment, AppointmentStatus, Patient } from '@/types/medical'
import {
  appointmentStatusOptions,
  getAppointmentStatusLabel,
  getAppointmentStatusVariant,
} from '@/utils/appointmentStatus'

interface AppointmentTableProps {
  appointments: Appointment[]
  patients?: Patient[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onViewDetail: (appointment: Appointment) => void
}

function resolvePatient(id: string, patients?: Patient[]) {
  return patients?.find((p) => p.id === id) ?? findPatientById(id)
}

export default function AppointmentTable({
  appointments,
  patients,
  onStatusChange,
  onViewDetail,
}: AppointmentTableProps) {
  const navigate = useNavigate()

  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white px-6 py-16 text-center shadow-sm">
        <p className="text-clinic-text/70">
          No se encontraron atenciones con los filtros aplicados.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
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
                Procedencia
              </th>
              <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                Estado
              </th>
              <th className="px-4 py-3 font-semibold text-clinic-deep-blue">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-clinic-sky/40">
            {appointments.map((apt) => {
              const patient = resolvePatient(apt.patientId, patients)
              const doctor = findDoctorById(apt.doctorId)
              const study = findStudyById(apt.studyId)

              return (
                <tr
                  key={apt.id}
                  className="transition hover:bg-clinic-bg/40"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-clinic-text">
                    <span className="font-medium">{apt.appointmentDate}</span>
                    <span className="block text-xs text-clinic-text/60">
                      {apt.appointmentTime}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-clinic-deep-blue">
                    {patient?.fullName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-clinic-text">
                    {patient?.dni ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-clinic-text whitespace-nowrap">
                    {patient ? `${patient.age} años · ${patient.sex}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-clinic-text">
                    {study?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-clinic-text">
                    {doctor?.fullName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-clinic-text">
                    {apt.origin}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={getAppointmentStatusLabel(apt.status)}
                      variant={getAppointmentStatusVariant(apt.status)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetail(apt)}
                        className="rounded-lg p-2 text-clinic-text/70 transition hover:bg-clinic-bg hover:text-clinic-blue"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/reports/new?appointmentId=${apt.id}`)
                        }
                        className="rounded-lg p-2 text-clinic-text/70 transition hover:bg-clinic-bg hover:text-clinic-teal"
                        title="Abrir informe"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <select
                        value={apt.status}
                        onChange={(e) =>
                          onStatusChange(
                            apt.id,
                            e.target.value as AppointmentStatus,
                          )
                        }
                        className="max-w-[140px] rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-2 py-1.5 text-xs text-clinic-text outline-none focus:border-clinic-blue"
                        title="Cambiar estado"
                      >
                        {appointmentStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {getAppointmentStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
