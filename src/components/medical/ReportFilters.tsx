import { RotateCcw } from 'lucide-react'
import type { Doctor, Study, ReportStatus } from '@/types/medical'
import type { ReportFilters as ReportFiltersState } from '@/utils/reportFilters'
import { reportStatusLabels } from '@/utils/reportStatus'

interface ReportFiltersProps {
  filters: ReportFiltersState
  doctors: Doctor[]
  studies: Study[]
  onChange: <K extends keyof ReportFiltersState>(
    key: K,
    value: ReportFiltersState[K],
  ) => void
  onClear: () => void
}

const statusOptions: (ReportStatus | 'all')[] = [
  'all',
  'missing_report',
  'missing_diagnostic_impression',
  'in_review',
  'concluded',
  'pdf_generated',
]

export default function ReportFiltersPanel({
  filters,
  doctors,
  studies,
  onChange,
  onClear,
}: ReportFiltersProps) {
  return (
    <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium text-clinic-deep-blue">
            Buscar
          </label>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder="Paciente, DNI o estudio..."
            className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2 text-sm outline-none focus:border-clinic-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-clinic-deep-blue">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onChange('status', e.target.value as ReportFiltersState['status'])
            }
            className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2 text-sm outline-none focus:border-clinic-blue"
          >
            <option value="all">Todos</option>
            {statusOptions
              .filter((s): s is ReportStatus => s !== 'all')
              .map((status) => (
                <option key={status} value={status}>
                  {reportStatusLabels[status]}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-clinic-deep-blue">
            Médico
          </label>
          <select
            value={filters.doctorId}
            onChange={(e) => onChange('doctorId', e.target.value)}
            className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2 text-sm outline-none focus:border-clinic-blue"
          >
            <option value="all">Todos</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-clinic-deep-blue">
            Estudio
          </label>
          <select
            value={filters.studyId}
            onChange={(e) => onChange('studyId', e.target.value)}
            className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2 text-sm outline-none focus:border-clinic-blue"
          >
            <option value="all">Todos</option>
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xs flex-1">
          <label className="mb-1 block text-xs font-medium text-clinic-deep-blue">
            Fecha
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2 text-sm outline-none focus:border-clinic-blue"
          />
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-clinic-sky px-4 py-2 text-sm font-medium text-clinic-text transition hover:bg-clinic-bg"
        >
          <RotateCcw className="h-4 w-4" />
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
