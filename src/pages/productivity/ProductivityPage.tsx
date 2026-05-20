import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Files,
  Info,
  Loader2,
  RefreshCw,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import DoctorProductivityDrawer from '@/components/medical/DoctorProductivityDrawer'
import DoctorProductivityTable from '@/components/medical/DoctorProductivityTable'
import OriginDistribution from '@/components/medical/OriginDistribution'
import ProductivityBars from '@/components/medical/ProductivityBars'
import ProductivityFilters from '@/components/medical/ProductivityFilters'
import StudyDistribution from '@/components/medical/StudyDistribution'
import SummaryCard from '@/components/ui/SummaryCard'
import { useProductivityData } from '@/hooks/useProductivityData'
import { getCurrentUser } from '@/services/authService'
import type { DoctorProductivitySummary, ProductivityFiltersState } from '@/types/medical'
import {
  defaultProductivityFilters,
  normalizeProductivityFilters,
  filterAppointmentsForProductivity,
  filterReportsForProductivity,
  findTopDoctorByMetric,
  getDoctorOriginBreakdown,
  getDoctorProductivity,
  getDoctorDetailStudies,
  getGeneralProductivitySummary,
  getOriginProductivity,
  getReportStatusDistribution,
  getStudyProductivity,
  resolveDateRange,
} from '@/utils/productivity'

export default function ProductivityPage() {
  const user = getCurrentUser()
  const [searchParams] = useSearchParams()
  const isAdmin = user?.role === 'admin'
  const isDoctor = user?.role === 'doctor'
  const isAssistant = user?.role === 'assistant'

  const { data, loadState, loadError, refetch } = useProductivityData()

  const doctorIdFromUrl = searchParams.get('doctorId')

  const buildFilters = (doctorId?: string | null) =>
    normalizeProductivityFilters({
      ...defaultProductivityFilters,
      doctorId: doctorId ?? 'all',
    })

  const [filters, setFilters] = useState<ProductivityFiltersState>(() =>
    buildFilters(doctorIdFromUrl),
  )
  const [applied, setApplied] = useState<ProductivityFiltersState>(() =>
    buildFilters(doctorIdFromUrl),
  )

  useEffect(() => {
    if (!doctorIdFromUrl || !isAdmin) return
    const next = buildFilters(doctorIdFromUrl)
    setFilters(next)
    setApplied(next)
  }, [doctorIdFromUrl, isAdmin])
  const [exportOpen, setExportOpen] = useState(false)
  const [detailDoctor, setDetailDoctor] = useState<DoctorProductivitySummary | null>(
    null,
  )

  const adminInDoctorsList = Boolean(
    isAdmin && user?.id && data.doctors.some((d) => d.id === user.id),
  )
  const viewingOwnProductivity =
    isDoctor || (isAdmin && applied.doctorId === user?.id)

  const baseParams = useMemo(
    () => ({
      doctors: data.doctors,
      appointments: data.appointments,
      reports: data.reports,
      studies: data.studies,
      specialties: data.specialties,
      patients: data.patients,
      period: applied.period,
      dateFrom: applied.dateFrom,
      dateTo: applied.dateTo,
      filters: applied,
      currentUser: user,
    }),
    [data, applied, user],
  )

  const general = useMemo(
    () => getGeneralProductivitySummary(baseParams),
    [baseParams],
  )

  const doctorRows = useMemo(
    () => getDoctorProductivity(baseParams),
    [baseParams],
  )

  const studyRows = useMemo(
    () =>
      getStudyProductivity({
        appointments: data.appointments,
        reports: data.reports,
        studies: data.studies,
        patients: data.patients,
        period: applied.period,
        dateFrom: applied.dateFrom,
        dateTo: applied.dateTo,
        filters: applied,
      }),
    [data, applied],
  )

  const originRows = useMemo(
    () =>
      getOriginProductivity({
        appointments: data.appointments,
        patients: data.patients,
        period: applied.period,
        dateFrom: applied.dateFrom,
        dateTo: applied.dateTo,
        filters: applied,
      }),
    [data, applied],
  )

  const range = useMemo(
    () => resolveDateRange(applied.period, applied.dateFrom, applied.dateTo),
    [applied],
  )

  const reportStatusBars = useMemo(
    () =>
      getReportStatusDistribution(
        data.reports,
        data.patients,
        data.appointments,
        data.studies,
        range,
        applied,
      ).map((item) => ({ label: item.label, value: item.count })),
    [data, range, applied],
  )

  const concludedByDoctor = useMemo(
    () =>
      doctorRows.map((d) => ({
        label: d.doctorName.replace(/^Dr\(a\)\.\s*/i, ''),
        value: d.concluded + d.pdfGenerated,
      })),
    [doctorRows],
  )

  const topConcludedId = findTopDoctorByMetric(doctorRows, 'concluded')
  const topPendingId = findTopDoctorByMetric(doctorRows, 'pending')

  const hasData =
    general.totalStudies > 0 ||
    general.totalReports > 0 ||
    doctorRows.some((d) => d.totalStudies > 0)

  const detailRange = range
  const detailStudyRows = detailDoctor
    ? getDoctorDetailStudies(
        detailDoctor.doctorId,
        data.appointments,
        data.reports,
        data.studies,
        detailRange,
      )
    : []
  const detailOriginRows = detailDoctor
    ? getDoctorOriginBreakdown(
        detailDoctor.doctorId,
        data.appointments,
        data.patients,
        detailRange,
      )
    : []
  const detailAppointments = detailDoctor
    ? filterAppointmentsForProductivity(
        data.appointments,
        data.patients,
        data.studies,
        detailRange,
        { ...applied, doctorId: detailDoctor.doctorId },
      )
        .sort((a, b) =>
          `${b.appointmentDate}${b.appointmentTime}`.localeCompare(
            `${a.appointmentDate}${a.appointmentTime}`,
          ),
        )
        .slice(0, 5)
    : []
  const detailReports = detailDoctor
    ? filterReportsForProductivity(
        data.reports,
        data.patients,
        data.appointments,
        data.studies,
        detailRange,
        { ...applied, doctorId: detailDoctor.doctorId },
      )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 8)
    : []

  if (isAssistant) {
    return (
      <div className="space-y-6">
        <PageHeader description="Indicadores por médico responsable" />
        <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-8 text-center shadow-sm">
          <Stethoscope className="mx-auto h-10 w-10 text-clinic-teal" />
          <h2 className="mt-4 text-lg font-semibold text-clinic-deep-blue">
            Productividad no disponible para este rol
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-clinic-text/70">
            Los asistentes pueden registrar pacientes y atenciones, pero la
            productividad médica se valida por médico responsable.
          </p>
        </div>
      </div>
    )
  }

  const pageSubtitle = viewingOwnProductivity
    ? 'Tus atenciones, estudios e informes en el periodo seleccionado.'
    : 'Analiza atenciones, estudios e informes generados por cada médico.'

  return (
    <div className="space-y-6">
      <PageHeader
        description={pageSubtitle}
        meta={
          loadState === 'success' ? (
            <p className="text-xs text-clinic-teal">{general.periodLabel}</p>
          ) : undefined
        }
      >
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-clinic-sky bg-clinic-white px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg"
          >
            <Download className="h-4 w-4" />
            Exportar reporte
          </button>
          <button
            type="button"
            onClick={() => void refetch({ silent: true })}
            disabled={loadState === 'loading'}
            className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
          >
            {loadState === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar datos
          </button>
      </PageHeader>

      <div className="flex gap-3 rounded-xl border border-clinic-teal/30 bg-clinic-sky/20 px-4 py-3 text-sm text-clinic-deep-blue">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-clinic-teal" />
        <p>
          La productividad se calcula a partir de las atenciones, estudios e informes
          registrados en la base de datos del sistema.
        </p>
      </div>

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      {loadState === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-clinic-text/70">
          <Loader2 className="h-5 w-5 animate-spin text-clinic-blue" />
          Cargando datos de productividad…
        </div>
      )}

      {loadState === 'success' && (
        <>
          <ProductivityFilters
            filters={filters}
            applied={applied}
            showDoctorFilter={isAdmin}
            doctors={data.doctors}
            specialties={data.specialties}
            studies={data.studies}
            onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
            onApply={() => setApplied(normalizeProductivityFilters(filters))}
            onClear={() => {
              const reset = buildFilters()
              setFilters(reset)
              setApplied(reset)
            }}
            extraActions={
              adminInDoctorsList && applied.doctorId !== user?.id ? (
                <button
                  type="button"
                  onClick={() => {
                    const mine = buildFilters(user!.id)
                    setFilters(mine)
                    setApplied(mine)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-clinic-blue/40 bg-clinic-sky/30 px-4 py-2.5 text-sm font-medium text-clinic-deep-blue hover:bg-clinic-sky/50"
                >
                  Ver mi productividad
                </button>
              ) : adminInDoctorsList && applied.doctorId === user?.id ? (
                <button
                  type="button"
                  onClick={() => {
                    const all = buildFilters()
                    setFilters(all)
                    setApplied(all)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-clinic-sky bg-clinic-white px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg"
                >
                  Ver todos los médicos
                </button>
              ) : null
            }
          />

          {!hasData ? (
            <div className="rounded-xl border border-dashed border-clinic-sky/60 bg-clinic-white px-6 py-12 text-center">
              <p className="text-sm text-clinic-text/70">
                No hay productividad registrada para los filtros seleccionados.
              </p>
              <button
                type="button"
                onClick={() => {
                  const reset = buildFilters()
                  setFilters(reset)
                  setApplied(reset)
                }}
                className="mt-4 rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCard
                  title="Pacientes atendidos"
                  value={general.totalPatients}
                  icon={<Users className="h-5 w-5" />}
                  detail={general.trendHint}
                />
                <SummaryCard
                  title="Estudios realizados"
                  value={general.totalStudies}
                  icon={<Stethoscope className="h-5 w-5" />}
                  accent="info"
                  detail={general.periodLabel}
                />
                <SummaryCard
                  title="Informes generados"
                  value={general.totalReports}
                  icon={<FileText className="h-5 w-5" />}
                  detail={
                    general.mostProductiveDoctor
                      ? `Más productivo: ${general.mostProductiveDoctor.replace(/^Dr\(a\)\.\s*/i, '')}`
                      : undefined
                  }
                />
                <SummaryCard
                  title="Informes pendientes"
                  value={general.totalPending}
                  icon={<ClipboardList className="h-5 w-5" />}
                  accent="warning"
                />
                <SummaryCard
                  title="Informes concluidos"
                  value={general.totalConcluded}
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  accent="success"
                />
                <SummaryCard
                  title="PDFs generados"
                  value={general.totalPdfGenerated}
                  icon={<Files className="h-5 w-5" />}
                  accent="info"
                  detail={
                    general.mostRequestedStudy
                      ? `Estudio más solicitado: ${general.mostRequestedStudy}`
                      : undefined
                  }
                />
              </div>

              {isAdmin && (
                <DoctorProductivityTable
                  rows={doctorRows}
                  topConcludedDoctorId={topConcludedId}
                  topPendingDoctorId={topPendingId}
                  highlightDoctorId={user?.id}
                  onViewDetail={setDetailDoctor}
                />
              )}

              {isDoctor && doctorRows[0] && (
                <DoctorProductivityTable
                  rows={doctorRows}
                  topConcludedDoctorId={doctorRows[0].doctorId}
                  topPendingDoctorId={doctorRows[0].doctorId}
                  onViewDetail={setDetailDoctor}
                />
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                {isAdmin && (
                  <ProductivityBars
                    title="Informes concluidos por médico"
                    items={concludedByDoctor}
                    highlightLabel={
                      concludedByDoctor.sort((a, b) => b.value - a.value)[0]?.label
                    }
                  />
                )}
                <StudyDistribution items={studyRows} />
                <OriginDistribution items={originRows} />
                <ProductivityBars
                  title="Estado general de informes"
                  items={reportStatusBars}
                />
              </div>
            </>
          )}

          <DoctorProductivityDrawer
            isOpen={Boolean(detailDoctor)}
            doctor={detailDoctor}
            studyRows={detailStudyRows}
            originRows={detailOriginRows}
            recentAppointments={detailAppointments}
            recentReports={detailReports}
            onClose={() => setDetailDoctor(null)}
          />
        </>
      )}

      {exportOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-clinic-deep-blue/40"
            onClick={() => setExportOpen(false)}
            aria-label="Cerrar"
          />
          <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-clinic-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-clinic-deep-blue">Exportar reporte</h3>
              <button type="button" onClick={() => setExportOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-clinic-text/70">
              La exportación en PDF o Excel estará disponible en una próxima actualización.
            </p>
            <button
              type="button"
              onClick={() => setExportOpen(false)}
              className="mt-6 w-full rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white"
            >
              Entendido
            </button>
          </div>
        </>
      )}
    </div>
  )
}
