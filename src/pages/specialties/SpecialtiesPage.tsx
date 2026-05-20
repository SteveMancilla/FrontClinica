import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  AlertTriangle,
  Eye,
  Info,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react'
import AssignDoctorModal from '@/components/medical/AssignDoctorModal'
import SpecialtyCard from '@/components/medical/SpecialtyCard'
import SpecialtyDetailDrawer from '@/components/medical/SpecialtyDetailDrawer'
import SpecialtyFormDrawer, {
  type SpecialtyFormInput,
} from '@/components/medical/SpecialtyFormDrawer'
import ToggleSpecialtyModal from '@/components/medical/ToggleSpecialtyModal'
import PageHeader from '@/components/layout/PageHeader'
import SummaryCard from '@/components/ui/SummaryCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { Loader2 } from 'lucide-react'
import { useSpecialtiesCatalogData } from '@/hooks/useSpecialtiesCatalogData'
import { getCurrentUser } from '@/services/authService'
import type { Specialty, SpecialtySummary } from '@/types/medical'
import {
  defaultSpecialtyFilters,
  filterSpecialtySummaries,
  getPageSummary,
  getSpecialtySummaries,
  type SpecialtyFilters,
} from '@/utils/specialties'
import { getDoctorOptionsForSelect } from '@/utils/userCatalog'

type ViewMode = 'cards' | 'table'

export default function SpecialtiesPage() {
  const user = getCurrentUser()
  const isAdmin = user?.role === 'admin'
  const canAdmin = isAdmin

  const catalog = useSpecialtiesCatalogData()
  const { studies, templates, appointments, reports, loadState, loadError, refetch } =
    catalog

  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [users, setUsers] = useState<typeof catalog.users>([])

  useEffect(() => {
    if (loadState === 'success') {
      setSpecialties(catalog.specialties)
      setUsers(catalog.users)
    }
  }, [loadState, catalog.specialties, catalog.users])

  const [filters, setFilters] = useState<SpecialtyFilters>(defaultSpecialtyFilters)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [detailSpecialty, setDetailSpecialty] = useState<Specialty | null>(null)
  const [toggleSpecialty, setToggleSpecialty] = useState<Specialty | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignDefaultId, setAssignDefaultId] = useState<string | undefined>()

  const doctorOptions = useMemo(() => getDoctorOptionsForSelect(users), [users])

  const summaries = useMemo(
    () =>
      getSpecialtySummaries(
        specialties,
        studies,
        templates,
        appointments,
        reports,
        users,
      ),
    [specialties, studies, templates, appointments, reports, users],
  )

  const filtered = useMemo(
    () => filterSpecialtySummaries(summaries, specialties, filters, studies, users),
    [summaries, specialties, filters, studies, users],
  )

  const pageSummary = useMemo(() => getPageSummary(summaries), [summaries])

  const detailSummary = detailSpecialty
    ? summaries.find((s) => s.specialtyId === detailSpecialty.id) ?? null
    : null

  const openCreate = () => {
    setFormMode('create')
    setEditingSpecialty(null)
    setFormOpen(true)
  }

  const openEdit = (specialty: Specialty) => {
    setFormMode('edit')
    setEditingSpecialty(specialty)
    setFormOpen(true)
  }

  const openDetail = (summary: SpecialtySummary) => {
    const spec = specialties.find((s) => s.id === summary.specialtyId)
    if (spec) setDetailSpecialty(spec)
  }

  const handleSaveSpecialty = (input: SpecialtyFormInput, existingId?: string) => {
    if (existingId) {
      setSpecialties((prev) =>
        prev.map((s) =>
          s.id === existingId
            ? {
                ...s,
                name: input.name.trim(),
                description: input.description.trim(),
                isActive: input.isActive,
                iconLabel: input.iconLabel.trim() || undefined,
                notes: input.notes.trim() || undefined,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      )
      setFormOpen(false)
      return
    }

    const created: Specialty = {
      id: `spec-${Date.now()}`,
      name: input.name.trim(),
      description: input.description.trim(),
      isActive: input.isActive,
      iconLabel: input.iconLabel.trim() || undefined,
      notes: input.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSpecialties((prev) => [...prev, created])
  }

  const handleToggle = () => {
    if (!toggleSpecialty) return
    setSpecialties((prev) =>
      prev.map((s) =>
        s.id === toggleSpecialty.id
          ? {
              ...s,
              isActive: s.isActive === false,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    )
  }

  const handleAssignDoctor = (specialtyId: string, doctorId: string) => {
    const specialty = specialties.find((s) => s.id === specialtyId)
    const doctor = users.find((u) => u.id === doctorId)
    if (!specialty || !doctor) return
    void doctorId
    setUsers((prev) =>
      prev.map((u) =>
        u.id === doctor.id ? { ...u, specialty: specialty.name } : u,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Organiza áreas médicas, médicos asociados, estudios y productividad por especialidad.">
        {canAdmin && (
          <>
            <HeaderBtn onClick={openCreate}>
              <Plus className="h-4 w-4" /> Nueva especialidad
            </HeaderBtn>
            <HeaderBtn
              onClick={() => {
                setAssignDefaultId(undefined)
                setAssignOpen(true)
              }}
            >
              <UserPlus className="h-4 w-4" /> Asignar médico
            </HeaderBtn>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
            >
              <Stethoscope className="h-4 w-4" /> Ver estudios
            </Link>
          </>
        )}
        {!canAdmin && (
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white"
          >
            <Eye className="h-4 w-4" /> Ver estudios y plantillas
          </Link>
        )}
      </PageHeader>

      {loadState === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-clinic-text/70">
          <Loader2 className="h-5 w-5 animate-spin text-clinic-blue" />
          Cargando especialidades desde el servidor…
        </div>
      )}

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}{' '}
          <button type="button" onClick={() => void refetch()} className="font-semibold underline">
            Reintentar
          </button>
        </p>
      )}

      <div className="flex gap-3 rounded-xl border border-clinic-teal/30 bg-clinic-sky/20 px-4 py-3 text-sm text-clinic-deep-blue">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-clinic-teal" />
        <p>
          Las especialidades agrupan médicos y estudios. Cada estudio mantiene su plantilla de
          informe en el módulo Estudios y plantillas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard title="Total de especialidades" value={pageSummary.total} icon={<Stethoscope className="h-5 w-5" />} />
        <SummaryCard title="Especialidades activas" value={pageSummary.active} icon={<Stethoscope className="h-5 w-5" />} accent="success" />
        <SummaryCard title="Médicos asociados" value={pageSummary.doctors} icon={<Users className="h-5 w-5" />} accent="info" />
        <SummaryCard title="Estudios relacionados" value={pageSummary.studies} icon={<List className="h-5 w-5" />} />
        <SummaryCard title="Plantillas pendientes" value={pageSummary.pendingTemplates} icon={<AlertTriangle className="h-5 w-5" />} accent="warning" />
      </div>

      <FiltersPanel
        filters={filters}
        doctorOptions={doctorOptions}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onClear={() => setFilters(defaultSpecialtyFilters)}
      />

      <div className="flex gap-2">
        <ViewTab active={viewMode === 'cards'} onClick={() => setViewMode('cards')}>
          <LayoutGrid className="h-4 w-4" /> Tarjetas
        </ViewTab>
        <ViewTab active={viewMode === 'table'} onClick={() => setViewMode('table')}>
          <List className="h-4 w-4" /> Vista tabla
        </ViewTab>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-clinic-white px-6 py-12 text-center">
          <p className="text-sm text-clinic-text/70">No hay especialidades para los filtros seleccionados.</p>
          <button type="button" onClick={() => setFilters(defaultSpecialtyFilters)} className="mt-4 rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white">
            Limpiar filtros
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((summary) => {
            const specialty = specialties.find((s) => s.id === summary.specialtyId)!
            return (
              <SpecialtyCard
                key={summary.specialtyId}
                summary={summary}
                specialty={specialty}
                canAdmin={canAdmin}
                onViewDetail={() => openDetail(summary)}
                onEdit={() => openEdit(specialty)}
                onToggle={() => setToggleSpecialty(specialty)}
                onViewStudies={() => {}}
                onViewDoctors={() => openDetail(summary)}
              />
            )
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b bg-clinic-bg/50">
                  {['Especialidad', 'Estado', 'Médicos', 'Estudios', 'Plantillas', 'Informes', 'Pendientes', 'Acciones'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-clinic-deep-blue">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-sky/40">
                {filtered.map((summary) => (
                    <tr key={summary.specialtyId} className="hover:bg-clinic-bg/30">
                      <td className="px-4 py-3 font-medium">{summary.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={summary.isActive ? 'Activa' : 'Inactiva'} variant={summary.isActive ? 'success' : 'neutral'} />
                      </td>
                      <td className="px-4 py-3 text-center">{summary.doctorsCount}</td>
                      <td className="px-4 py-3 text-center">{summary.studiesCount}</td>
                      <td className="px-4 py-3 text-center">{summary.templatesActiveCount} / {summary.templatesPendingCount} pend.</td>
                      <td className="px-4 py-3 text-center">{summary.reportsCount}</td>
                      <td className="px-4 py-3 text-center">{summary.pendingReportsCount}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => openDetail(summary)} className="text-xs font-medium text-clinic-blue">
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SpecialtyFormDrawer
        isOpen={formOpen}
        mode={formMode}
        initial={editingSpecialty}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveSpecialty}
      />

      <SpecialtyDetailDrawer
        isOpen={Boolean(detailSpecialty)}
        specialty={detailSpecialty}
        summary={detailSummary}
        studies={studies}
        templates={templates}
        appointments={appointments}
        reports={reports}
        patients={[]}
        users={users}
        canAdmin={canAdmin}
        onClose={() => setDetailSpecialty(null)}
        onEdit={() => detailSpecialty && openEdit(detailSpecialty)}
        onAssignDoctor={() => {
          setAssignDefaultId(detailSpecialty?.id)
          setAssignOpen(true)
        }}
        onToggle={() => detailSpecialty && setToggleSpecialty(detailSpecialty)}
      />

      <ToggleSpecialtyModal
        isOpen={Boolean(toggleSpecialty)}
        specialty={toggleSpecialty}
        onClose={() => setToggleSpecialty(null)}
        onConfirm={handleToggle}
      />

      <AssignDoctorModal
        isOpen={assignOpen}
        specialties={specialties}
        doctors={users}
        defaultSpecialtyId={assignDefaultId}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssignDoctor}
      />
    </div>
  )
}

function HeaderBtn({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-clinic-sky bg-clinic-white px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg"
    >
      {children}
    </button>
  )
}

function FiltersPanel({
  filters,
  doctorOptions,
  onChange,
  onClear,
}: {
  filters: SpecialtyFilters
  doctorOptions: { id: string; name: string }[]
  onChange: (patch: Partial<SpecialtyFilters>) => void
  onClear: () => void
}) {
  const selectClass = 'rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm'

  return (
    <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Buscar especialidad..."
          className={`${selectClass} lg:col-span-2`}
        />
        <select value={filters.status} onChange={(e) => onChange({ status: e.target.value as SpecialtyFilters['status'] })} className={selectClass}>
          <option value="all">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </select>
        <select value={filters.doctorId} onChange={(e) => onChange({ doctorId: e.target.value })} className={selectClass}>
          <option value="all">Todos los médicos</option>
          {doctorOptions.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select value={filters.studyType} onChange={(e) => onChange({ studyType: e.target.value as SpecialtyFilters['studyType'] })} className={selectClass}>
          <option value="all">Todos los estudios</option>
          <option value="eco">Ecografía</option>
          <option value="rx">Radiografía</option>
          <option value="other">Otros</option>
        </select>
        <button type="button" onClick={onClear} className="inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2.5 text-sm font-medium hover:bg-clinic-bg">
          <RotateCcw className="h-4 w-4" /> Limpiar filtros
        </button>
      </div>
    </div>
  )
}

function ViewTab({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium',
        active ? 'bg-clinic-blue text-clinic-white' : 'border border-clinic-sky text-clinic-text hover:bg-clinic-bg',
      )}
    >
      {children}
    </button>
  )
}
