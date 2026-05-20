import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, UserPlus, X } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import type { SystemUser } from '@/types/auth'
import type { Specialty, Study } from '@/types/medical'
import type { ReportTemplate } from '@/types/medical'
import {
  getDoctorsForSpecialty,
  getSpecialtyOriginBreakdown,
  getSpecialtyReportStats,
  getStudyWithTemplateStatus,
} from '@/utils/specialties'
import { getFormatTypeLabel } from '@/utils/templateCatalog'
import { studyCatalogStatusVariants } from '@/utils/templateCatalog'
import type { Appointment, MedicalReport, Patient, SpecialtySummary } from '@/types/medical'

interface SpecialtyDetailDrawerProps {
  isOpen: boolean
  specialty: Specialty | null
  summary: SpecialtySummary | null
  studies: Study[]
  templates: ReportTemplate[]
  appointments: Appointment[]
  reports: MedicalReport[]
  patients: Patient[]
  users: SystemUser[]
  canAdmin: boolean
  onClose: () => void
  onEdit: () => void
  onAssignDoctor: () => void
  onToggle: () => void
}

export default function SpecialtyDetailDrawer({
  isOpen,
  specialty,
  summary,
  studies,
  templates,
  appointments,
  reports,
  patients,
  users,
  canAdmin,
  onClose,
  onEdit,
  onAssignDoctor,
  onToggle,
}: SpecialtyDetailDrawerProps) {
  if (!isOpen || !specialty || !summary) return null

  const doctors = getDoctorsForSpecialty(specialty, users)
  const specialtyStudies = studies.filter((s) => s.specialtyId === specialty.id)
  const stats = getSpecialtyReportStats(specialty.id, studies, appointments, reports)
  const origins = getSpecialtyOriginBreakdown(specialty.id, studies, appointments, patients)

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-clinic-deep-blue/40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-clinic-bg shadow-2xl">
        <header className="border-b border-clinic-sky/60 bg-clinic-white px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-clinic-deep-blue">Detalle de especialidad</h2>
              <p className="font-medium">{specialty.name}</p>
              <StatusBadge label={summary.isActive ? 'Activa' : 'Inactiva'} variant={summary.isActive ? 'success' : 'neutral'} />
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-clinic-bg"><X className="h-5 w-5" /></button>
          </div>
          {canAdmin && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn onClick={onEdit}><Pencil className="h-4 w-4" /> Editar especialidad</Btn>
              <Btn onClick={onAssignDoctor}><UserPlus className="h-4 w-4" /> Asignar médico</Btn>
              <Btn onClick={onToggle}>Activar / Desactivar</Btn>
              <Link to="/templates" className="inline-flex items-center gap-1 rounded-lg border border-clinic-sky bg-clinic-white px-3 py-2 text-xs font-medium hover:bg-clinic-bg">
                Ver estudios y plantillas
              </Link>
            </div>
          )}
          {!canAdmin && (
            <Link to="/templates" className="mt-4 inline-flex items-center gap-1 rounded-lg border border-clinic-sky bg-clinic-white px-3 py-2 text-xs font-medium">
              <Eye className="h-4 w-4" /> Ver estudios y plantillas
            </Link>
          )}
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
            <h3 className="font-semibold text-clinic-deep-blue">Datos generales</h3>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <Row label="Descripción" value={specialty.description ?? '—'} span />
              <Row label="Creación" value={specialty.createdAt ? new Date(specialty.createdAt).toLocaleDateString('es-PE') : '—'} />
              <Row label="Actualización" value={specialty.updatedAt ? new Date(specialty.updatedAt).toLocaleDateString('es-PE') : '—'} />
            </dl>
          </section>

          <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
            <h3 className="font-semibold text-clinic-deep-blue">Médicos asociados</h3>
            {doctors.length === 0 ? (
              <p className="mt-2 text-sm text-clinic-text/60">Sin médicos asociados por nombre de especialidad.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-clinic-text/60">
                      <th className="py-2">Médico</th>
                      <th>CMP/RNE</th>
                      <th>Estado</th>
                      <th>Informes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((d) => (
                      <tr key={d.id} className="border-b border-clinic-sky/30">
                        <td className="py-2">{d.fullName}</td>
                        <td className="text-xs">{[d.cmp, d.rne].filter(Boolean).join(' · ') || '—'}</td>
                        <td><StatusBadge label={d.status === 'active' ? 'Activo' : 'Inactivo'} variant={d.status === 'active' ? 'success' : 'neutral'} /></td>
                        <td>{reports.filter((r) => r.doctorId === d.doctorId).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
            <h3 className="font-semibold text-clinic-deep-blue">Estudios relacionados</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-left text-clinic-text/60">
                    <th className="py-2">Estudio</th>
                    <th>Formato</th>
                    <th>Plantilla</th>
                    <th>Estado plantilla</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {specialtyStudies.map((study) => {
                    const row = getStudyWithTemplateStatus(study, templates)
                    const variant = studyCatalogStatusVariants[row.status]
                    return (
                      <tr key={study.id} className="border-b border-clinic-sky/30">
                        <td className="py-2 font-medium">{study.name}</td>
                        <td className="text-xs">{getFormatTypeLabel(study.formatType)}</td>
                        <td className="font-mono text-xs">{study.templateId || '—'}</td>
                        <td><StatusBadge label={row.label} variant={variant} /></td>
                        <td>
                          {study.templateId && (
                            <Link to="/templates" className="text-xs font-medium text-clinic-blue">Ver plantilla</Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
            <h3 className="font-semibold text-clinic-deep-blue">Productividad de la especialidad</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Atenciones" value={stats.appointments} />
              <Stat label="Informes" value={stats.reports} />
              <Stat label="Falta informe" value={stats.missingReport} warn />
              <Stat label="Falta impresión" value={stats.missingImpression} warn />
              <Stat label="En revisión" value={stats.inReview} />
              <Stat label="Concluidos" value={stats.concluded} ok />
              <Stat label="PDF generado" value={stats.pdfGenerated} ok />
            </div>
          </section>

          {origins.length > 0 && (
            <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
              <h3 className="font-semibold text-clinic-deep-blue">Procedencia de pacientes</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {origins.map((o) => (
                  <span key={o.origin} className="rounded-full border border-clinic-sky bg-clinic-bg px-3 py-1 text-xs">
                    {o.origin}: <strong>{o.total}</strong>
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="border-t bg-clinic-white p-4">
          <button type="button" onClick={onClose} className="w-full rounded-lg border py-2.5 text-sm">Cerrar</button>
        </footer>
      </aside>
    </>
  )
}

function Row({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <dt className="text-xs text-clinic-text/50">{label}</dt>
      <dd className="font-medium text-clinic-deep-blue">{value}</dd>
    </div>
  )
}

function Stat({ label, value, warn, ok }: { label: string; value: number; warn?: boolean; ok?: boolean }) {
  const cls = warn ? 'text-amber-700' : ok ? 'text-emerald-700' : 'text-clinic-deep-blue'
  return (
    <div className="rounded-lg bg-clinic-bg/50 px-3 py-2">
      <p className="text-xs text-clinic-text/50">{label}</p>
      <p className={`text-xl font-bold ${cls}`}>{value}</p>
    </div>
  )
}

function Btn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky bg-clinic-white px-3 py-2 text-xs font-medium hover:bg-clinic-bg">
      {children}
    </button>
  )
}
