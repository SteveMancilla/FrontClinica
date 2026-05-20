import { Link } from 'react-router-dom'
import { RefreshCw, User } from 'lucide-react'
import type { Patient } from '@/types/medical'
import { getPatientInitials } from '@/utils/patientCatalog'

interface SelectedPatientCardProps {
  patient: Patient
  onChangePatient: () => void
  allowChangePatient?: boolean
  onViewChart?: (patient: Patient) => void
}

export default function SelectedPatientCard({
  patient,
  onChangePatient,
  allowChangePatient = true,
  onViewChart,
}: SelectedPatientCardProps) {
  return (
    <section className="rounded-xl border border-clinic-teal/40 bg-clinic-teal/5 p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-clinic-teal/20 text-sm font-bold text-clinic-teal"
          aria-hidden
        >
          {getPatientInitials(patient.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-clinic-teal">
            Paciente seleccionado
          </p>
          <p className="mt-1 font-semibold text-clinic-deep-blue">{patient.fullName}</p>
          <dl className="mt-2 grid gap-1 text-sm text-clinic-text/80 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-clinic-text/50">DNI</dt>
              <dd>{patient.dni}</dd>
            </div>
            <div>
              <dt className="text-xs text-clinic-text/50">Edad / Sexo</dt>
              <dd>
                {patient.age} años · {patient.sex}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-clinic-text/50">Celular</dt>
              <dd>{patient.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-clinic-text/50">Procedencia</dt>
              <dd>{patient.origin}</dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            {allowChangePatient && (
              <button
                type="button"
                onClick={onChangePatient}
                className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky bg-clinic-white px-3 py-1.5 text-xs font-medium text-clinic-text hover:bg-clinic-bg"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Cambiar paciente
              </button>
            )}
            {onViewChart ? (
              <button
                type="button"
                onClick={() => onViewChart(patient)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-blue/30 bg-clinic-white px-3 py-1.5 text-xs font-medium text-clinic-blue hover:bg-clinic-blue/5"
              >
                <User className="h-3.5 w-3.5" />
                Ver ficha
              </button>
            ) : (
              <Link
                to={`/patients/${patient.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-blue/30 bg-clinic-white px-3 py-1.5 text-xs font-medium text-clinic-blue hover:bg-clinic-blue/5"
              >
                <User className="h-3.5 w-3.5" />
                Ver ficha
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
