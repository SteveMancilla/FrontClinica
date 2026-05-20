import type { ReportEditorContext } from '@/types/medical'
import { getFormatTypeLabel } from '@/utils/reportDraft'

interface ReportPatientInfoCardProps {
  context: ReportEditorContext
}

export default function ReportPatientInfoCard({
  context,
}: ReportPatientInfoCardProps) {
  const { patient, doctor, study, specialty, appointment, template } = context

  const items = [
    { label: 'Paciente', value: patient.fullName },
    { label: 'DNI', value: patient.dni },
    { label: 'Edad', value: `${patient.age} años` },
    { label: 'Sexo', value: patient.sex },
    { label: 'Procedencia', value: appointment.origin },
    { label: 'Estudio', value: study.name },
    { label: 'Especialidad', value: specialty.name },
    { label: 'Médico responsable', value: doctor.fullName },
    {
      label: 'Fecha y hora',
      value: `${appointment.appointmentDate} ${appointment.appointmentTime}`,
    },
    { label: 'Plantilla asignada', value: template.name },
    {
      label: 'Tipo de formato',
      value: getFormatTypeLabel(template.formatType),
    },
  ]

  return (
    <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-clinic-teal">
        Datos del informe — carga automática
      </p>
      <p className="mt-1 text-sm text-clinic-text/60">
        Completados desde la atención y el estudio registrado.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs text-clinic-text/50">{item.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-clinic-deep-blue">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
