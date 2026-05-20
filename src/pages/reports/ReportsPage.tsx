import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Files,
  Sparkles,
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import ReportFiltersPanel from '@/components/medical/ReportFilters'
import ReportsTable from '@/components/medical/ReportsTable'
import SummaryCard from '@/components/ui/SummaryCard'
import { getCurrentUser } from '@/services/authService'
import { getMedicalReports } from '@/services/medicalReportService'
import { getStudies } from '@/services/studyService'
import { getUsers } from '@/services/userService'
import { formatDoctorHonorificName } from '@/utils/doctorDisplay'
import type { Doctor, Study } from '@/types/medical'
import type { MedicalReport, ReportStatus } from '@/types/medical'
import {
  defaultReportFilters,
  filterReports,
  getReportSummary,
  type ReportFilters,
} from '@/utils/reportFilters'
import { reportChipOptions, type ReportChipFilter } from '@/utils/reportStatus'

export default function ReportsPage() {
  const user = getCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [allReports, setAllReports] = useState<MedicalReport[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'success'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ReportFilters>(defaultReportFilters)
  const [filterDoctors, setFilterDoctors] = useState<Doctor[]>([])
  const [filterStudies, setFilterStudies] = useState<Study[]>([])

  useEffect(() => {
    const load = async () => {
      setLoadState('loading')
      setLoadError(null)
      try {
        const [reports, users, studies] = await Promise.all([
          getMedicalReports(),
          getUsers(),
          getStudies(),
        ])
        setAllReports(reports)
        setFilterStudies(studies)
        setFilterDoctors(
          users
            .filter((u) => u.role === 'doctor' && u.status === 'active')
            .map((u) => ({
              id: u.id,
              fullName: formatDoctorHonorificName(u.fullName),
              specialty: u.specialty ?? '',
              cmp: u.cmp,
              rne: u.rne,
            })),
        )
        setLoadState('success')
      } catch (error) {
        setLoadState('error')
        setLoadError(
          error instanceof Error ? error.message : 'No se pudieron cargar los informes.',
        )
      }
    }
    void load()
  }, [user?.email])

  const baseReports = useMemo(() => {
    if (!user || user.role === 'admin') return allReports
    return allReports
  }, [user, allReports])

  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (patientId) {
      setFilters((prev) => ({ ...prev, patientId }))
    }
  }, [searchParams])

  const filtered = useMemo(
    () => filterReports(baseReports, filters),
    [baseReports, filters],
  )

  const summary = useMemo(() => getReportSummary(baseReports), [baseReports])

  const updateFilter = <K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleChipClick = (chip: ReportChipFilter) => {
    setFilters((prev) => ({
      ...prev,
      chip,
      status:
        chip === 'all' || chip === 'concluded_group'
          ? 'all'
          : (chip as ReportStatus),
    }))
  }

  const clearFilters = () => {
    setFilters(defaultReportFilters)
    if (searchParams.has('patientId')) {
      searchParams.delete('patientId')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const showConcluded = () => {
    setFilters((prev) => ({
      ...prev,
      chip: 'concluded_group',
      status: 'all',
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Gestiona informes médicos por estado, estudio, médico y paciente."
        meta={
          user ? (
            <p className="text-xs text-clinic-teal">
              {user.role === 'admin' && 'Vista completa — todos los informes'}
              {user.role === 'doctor' && 'Vista médico — informes asignados a tu perfil'}
              {user.role === 'assistant' &&
                'Vista asistente — informes del equipo médico asociado'}
            </p>
          ) : undefined
        }
      >
        <button
          type="button"
          onClick={showConcluded}
          className="inline-flex items-center gap-2 rounded-lg border border-clinic-sky px-4 py-2.5 text-sm font-medium text-clinic-deep-blue transition hover:bg-clinic-bg"
        >
          <CheckCircle2 className="h-4 w-4" />
          Ver concluidos
        </button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total de informes"
          value={summary.total}
          icon={<Files className="h-5 w-5" />}
          detail="En tu bandeja"
        />
        <SummaryCard
          title="Falta informe"
          value={summary.missingReport}
          icon={<FileText className="h-5 w-5" />}
          accent="warning"
          detail="Prioridad alta"
        />
        <SummaryCard
          title="Falta impresión"
          value={summary.missingImpression}
          icon={<Sparkles className="h-5 w-5" />}
          accent="danger"
          detail="Requiere IA local"
        />
        <SummaryCard
          title="En revisión"
          value={summary.inReview}
          icon={<ClipboardList className="h-5 w-5" />}
          accent="purple"
          detail="Dictado en curso"
        />
        <SummaryCard
          title="Concluidos / PDF"
          value={summary.concludedOrPdf}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="success"
          detail="Listos o generados"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {reportChipOptions.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => handleChipClick(chip.value)}
            className={clsx(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              filters.chip === chip.value
                ? 'border-clinic-blue bg-clinic-blue text-clinic-white'
                : 'border-clinic-sky/80 bg-clinic-white text-clinic-text hover:border-clinic-blue/50',
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <ReportFiltersPanel
        filters={filters}
        doctors={filterDoctors}
        studies={filterStudies}
        onChange={updateFilter}
        onClear={clearFilters}
      />

      {loadState === 'loading' && (
        <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white px-6 py-12 text-center text-sm text-clinic-text/70">
          Cargando informes...
        </div>
      )}

      {loadState === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm text-red-700">
            {loadError ?? 'No se pudieron cargar los informes.'}
          </p>
        </div>
      )}

      {loadState === 'success' && filtered.length > 0 && (
        <ReportsTable reports={filtered} />
      )}

      {loadState === 'success' && filtered.length === 0 && (
        <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white px-6 py-16 text-center shadow-sm">
          <p className="text-clinic-text/70">
            No se encontraron informes con los filtros seleccionados.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
