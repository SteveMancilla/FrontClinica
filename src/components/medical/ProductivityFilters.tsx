import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Doctor, Specialty, Study, PatientOrigin, ProductivityFiltersState } from '@/types/medical'

const originOptions: PatientOrigin[] = [
  'Particular',
  'Emergencia',
  'Consulta externa',
  'Referido',
  'Convenio',
  'Hospitalización',
]

interface ProductivityFiltersProps {
  filters: ProductivityFiltersState
  applied: ProductivityFiltersState
  showDoctorFilter: boolean
  doctors: Doctor[]
  specialties: Specialty[]
  studies: Study[]
  onChange: (patch: Partial<ProductivityFiltersState>) => void
  onApply: () => void
  onClear: () => void
  extraActions?: ReactNode
}

const selectClass =
  'rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm'

export default function ProductivityFilters({
  filters,
  applied,
  showDoctorFilter,
  doctors,
  specialties,
  studies,
  onChange,
  onApply,
  onClear,
  extraActions,
}: ProductivityFiltersProps) {
  const isCustom = filters.period === 'custom'

  return (
    <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-clinic-deep-blue">Periodo</span>
          <select
            value={filters.period}
            onChange={(e) =>
              onChange({
                period: e.target.value as ProductivityFiltersState['period'],
              })
            }
            className={`${selectClass} w-full`}
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="custom">Personalizado</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-clinic-deep-blue">Fecha desde</span>
          <input
            type="date"
            disabled={!isCustom}
            value={filters.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className={`${selectClass} w-full disabled:bg-clinic-bg/60`}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-clinic-deep-blue">Fecha hasta</span>
          <input
            type="date"
            disabled={!isCustom}
            value={filters.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            className={`${selectClass} w-full disabled:bg-clinic-bg/60`}
          />
        </label>

        {showDoctorFilter && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-clinic-deep-blue">Médico</span>
            <select
              value={filters.doctorId}
              onChange={(e) => onChange({ doctorId: e.target.value })}
              className={`${selectClass} w-full`}
            >
              <option value="all">Todos los médicos</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.specialty ? `${d.fullName} — ${d.specialty}` : d.fullName}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-clinic-deep-blue">Especialidad</span>
          <select
            value={filters.specialtyId}
            onChange={(e) => onChange({ specialtyId: e.target.value })}
            className={`${selectClass} w-full`}
          >
            <option value="all">Todas</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-clinic-deep-blue">Estudio</span>
          <select
            value={filters.studyId}
            onChange={(e) => onChange({ studyId: e.target.value })}
            className={`${selectClass} w-full`}
          >
            <option value="all">Todos</option>
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-clinic-deep-blue">Procedencia</span>
          <select
            value={filters.origin}
            onChange={(e) =>
              onChange({
                origin: e.target.value as ProductivityFiltersState['origin'],
              })
            }
            className={`${selectClass} w-full`}
          >
            <option value="all">Todas</option>
            {originOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onApply}
          className="rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-lg border border-clinic-sky px-4 py-2 text-sm font-medium hover:bg-clinic-bg"
        >
          <RotateCcw className="h-4 w-4" />
          Limpiar filtros
        </button>
        {JSON.stringify(applied) !== JSON.stringify(filters) && (
          <span className="text-xs text-amber-700">Hay filtros sin aplicar</span>
        )}
        {extraActions}
      </div>
    </div>
  )
}
