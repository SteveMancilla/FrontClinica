import { type ReactNode } from 'react'
import { Eye, FileStack, Pencil, Power, Stethoscope, Users } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Specialty, SpecialtySummary } from '@/types/medical'

interface SpecialtyCardProps {
  summary: SpecialtySummary
  specialty: Specialty
  canAdmin: boolean
  onViewDetail: () => void
  onEdit: () => void
  onToggle: () => void
  onViewStudies: () => void
  onViewDoctors: () => void
}

export default function SpecialtyCard({
  summary,
  specialty,
  canAdmin,
  onViewDetail,
  onEdit,
  onToggle,
  onViewStudies,
  onViewDoctors,
}: SpecialtyCardProps) {
  return (
    <article
      className={`flex flex-col rounded-xl border bg-clinic-white p-5 shadow-sm transition hover:shadow-md ${
        summary.isActive ? 'border-clinic-sky/50' : 'border-red-100 bg-red-50/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-clinic-teal/15 text-sm font-bold text-clinic-teal">
            {specialty.iconLabel ?? summary.name.slice(0, 3).toUpperCase()}
          </span>
          <div>
            <h3 className="font-semibold text-clinic-deep-blue">{summary.name}</h3>
            <StatusBadge
              label={summary.isActive ? 'Activa' : 'Inactiva'}
              variant={summary.isActive ? 'success' : 'neutral'}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-clinic-text/70">
        {summary.description ?? 'Sin descripción'}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Metric icon={<Users className="h-3.5 w-3.5" />} label="Médicos" value={summary.doctorsCount} />
        <Metric icon={<Stethoscope className="h-3.5 w-3.5" />} label="Estudios" value={summary.studiesCount} />
        <Metric
          icon={<FileStack className="h-3.5 w-3.5" />}
          label="Plantillas"
          value={`${summary.templatesActiveCount} activas`}
        />
        <Metric label="Informes" value={summary.reportsCount} />
        <Metric label="Pendientes" value={summary.pendingReportsCount} accent="warning" />
        <Metric label="Pend. plantilla" value={summary.templatesPendingCount} accent="warning" />
      </dl>

      {summary.mainStudies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {summary.mainStudies.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-clinic-bg px-2 py-0.5 text-[10px] text-clinic-text"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-clinic-sky/40 pt-4">
        <CardBtn onClick={onViewDetail}>
          <Eye className="h-3.5 w-3.5" />
          Ver detalle
        </CardBtn>
        {canAdmin && (
          <>
            <CardBtn onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </CardBtn>
            <CardBtn onClick={onToggle}>
              <Power className="h-3.5 w-3.5" />
              {summary.isActive ? 'Desactivar' : 'Activar'}
            </CardBtn>
          </>
        )}
        <CardBtn onClick={onViewStudies}>Ver estudios</CardBtn>
        <CardBtn onClick={onViewDoctors}>Ver médicos</CardBtn>
      </div>
    </article>
  )
}

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon?: ReactNode
  label: string
  value: number | string
  accent?: 'warning'
}) {
  return (
    <div className={accent === 'warning' ? 'text-amber-700' : 'text-clinic-text'}>
      <dt className="flex items-center gap-1 text-clinic-text/50">
        {icon}
        {label}
      </dt>
      <dd className="font-semibold text-clinic-deep-blue">{value}</dd>
    </div>
  )
}

function CardBtn({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-clinic-sky/80 px-2.5 py-1.5 text-xs font-medium text-clinic-text hover:bg-clinic-bg"
    >
      {children}
    </button>
  )
}
