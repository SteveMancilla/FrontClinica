import { useMemo } from 'react'
import { Info, Search, UserPlus } from 'lucide-react'
import type { Patient } from '@/types/medical'

const MIN_QUERY_FOR_EMPTY = 4

interface PatientSearchBoxProps {
  patients: Patient[]
  query: string
  onQueryChange: (value: string) => void
  onSelect: (patient: Patient) => void
  onRegisterNew: () => void
}

function filterPatients(patients: Patient[], query: string): Patient[] {
  const search = query.trim().toLowerCase()
  if (!search) return []

  const digitsOnly = query.replace(/\D/g, '')

  return patients.filter((patient) => {
    const nameMatch = patient.fullName.toLowerCase().includes(search)
    const phoneMatch = patient.phone.includes(search)
    const dniMatch =
      patient.dni.includes(search) ||
      (digitsOnly.length > 0 && patient.dni.includes(digitsOnly))
    return nameMatch || phoneMatch || dniMatch
  })
}

export default function PatientSearchBox({
  patients,
  query,
  onQueryChange,
  onSelect,
  onRegisterNew,
}: PatientSearchBoxProps) {
  const filteredPatients = useMemo(
    () => filterPatients(patients, query),
    [patients, query],
  )

  const trimmed = query.trim()
  const showResults = trimmed.length > 0 && filteredPatients.length > 0
  const showEmpty = trimmed.length >= MIN_QUERY_FOR_EMPTY && filteredPatients.length === 0

  return (
    <section className="relative z-10">
      <label
        htmlFor="patient-search-input"
        className="mb-1.5 block text-sm font-medium text-clinic-deep-blue"
      >
        Buscar paciente
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-clinic-text/40"
          aria-hidden
        />
        <input
          id="patient-search-input"
          type="text"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por DNI, nombre o celular..."
          className="relative z-10 w-full rounded-lg border border-clinic-sky/80 bg-clinic-white py-3 pr-4 pl-10 text-sm text-clinic-text outline-none focus:border-clinic-blue focus:ring-2 focus:ring-clinic-blue/20"
        />
      </div>

      {showResults && (
        <ul className="relative z-10 mt-2 max-h-52 overflow-y-auto rounded-lg border border-clinic-sky/60 bg-clinic-white shadow-md">
          {filteredPatients.map((patient) => (
            <li key={patient.id}>
              <button
                type="button"
                onClick={() => onSelect(patient)}
                className="w-full border-b border-clinic-sky/30 px-4 py-3 text-left transition-colors last:border-0 hover:bg-clinic-bg"
              >
                <span className="font-medium text-clinic-deep-blue">{patient.fullName}</span>
                <span className="mt-0.5 block text-xs text-clinic-text/60">
                  DNI: {patient.dni} · {patient.age} años · {patient.sex}
                </span>
                <span className="block text-xs text-clinic-text/50">
                  Celular: {patient.phone} · {patient.origin}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <div className="relative z-10 mt-3 rounded-lg border border-clinic-sky/50 bg-clinic-bg/40 px-4 py-4">
          <div className="flex gap-2 text-sm text-clinic-text/70">
            <Info className="h-5 w-5 shrink-0 text-clinic-blue" />
            <p>No se encontró un paciente registrado con ese dato.</p>
          </div>
          <button
            type="button"
            onClick={onRegisterNew}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
          >
            <UserPlus className="h-4 w-4" />
            Registrar nuevo paciente
          </button>
        </div>
      )}

      {trimmed.length > 0 && trimmed.length < MIN_QUERY_FOR_EMPTY && filteredPatients.length === 0 && (
        <p className="mt-2 text-xs text-clinic-text/50">
          Escribe al menos {MIN_QUERY_FOR_EMPTY} caracteres para buscar o registrar.
        </p>
      )}

      <button
        type="button"
        onClick={onRegisterNew}
        className="relative z-10 mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-clinic-teal hover:text-clinic-deep-blue"
      >
        <UserPlus className="h-4 w-4" />
        Registrar nuevo paciente
      </button>
    </section>
  )
}
