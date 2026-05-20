import { Eye, FileText, Pencil, Plus, Power } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import type { ReportTemplate, Study } from '@/types/medical'
import {
  getDictationModeLabel,
  getFormatTypeLabel,
  getDefaultTemplateForStudy,
  getSpecialtyName,
  getStudyCatalogStatus,
  resolveTemplatesForStudy,
  studyCatalogStatusLabels,
  studyCatalogStatusVariants,
} from '@/utils/templateCatalog'

interface StudyTableProps {
  studies: Study[]
  templates: ReportTemplate[]
  selectedStudyId: string | null
  canEdit: boolean
  onSelect: (studyId: string) => void
  onViewTemplate: (study: Study) => void
  onCreateTemplate: (study: Study) => void
  onEditStudy: (study: Study) => void
  onToggleActive: (study: Study) => void
}

export default function StudyTable({
  studies,
  templates,
  selectedStudyId,
  canEdit,
  onSelect,
  onViewTemplate,
  onCreateTemplate,
  onEditStudy,
  onToggleActive,
}: StudyTableProps) {
  if (studies.length === 0) {
    return (
      <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white px-6 py-12 text-center text-sm text-clinic-text/60">
        No hay estudios que coincidan con los filtros.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-clinic-sky/60 bg-clinic-bg/60">
              {['Bloque / Estudio', 'Especialidad', 'Formato principal', 'Plantilla predeterminada', 'Total plantillas', 'Estado', 'Acciones'].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-semibold text-clinic-deep-blue">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-clinic-sky/40">
            {studies.map((study) => {
              const status = getStudyCatalogStatus(study, templates)
              const template = getDefaultTemplateForStudy(study, templates)
              const totalTemplates = resolveTemplatesForStudy(study, templates).length
              const isSelected = selectedStudyId === study.id

              return (
                <tr
                  key={study.id}
                  onClick={() => onSelect(study.id)}
                  className={`cursor-pointer transition hover:bg-clinic-bg/40 ${
                    isSelected ? 'bg-clinic-sky/25' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-clinic-deep-blue">
                    <span className="block text-xs text-clinic-text/60">{study.block ?? '—'}</span>
                    <span>{study.name}</span>
                  </td>
                  <td className="px-4 py-3 text-clinic-text">
                    {study.specialtyName ?? getSpecialtyName(study.specialtyId)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-clinic-text/80">
                      {getFormatTypeLabel(study.formatType)}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-clinic-teal">
                      {getDictationModeLabel(study.formatType)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-clinic-text">
                    {template ? (
                      <span className="font-medium text-clinic-deep-blue">{template.name}</span>
                    ) : (
                      <span className="text-clinic-text/50">Sin plantilla predeterminada</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-clinic-text">{totalTemplates}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={studyCatalogStatusLabels[status]}
                      variant={studyCatalogStatusVariants[status]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionBtn
                        title="Ver plantilla"
                        onClick={() => onViewTemplate(study)}
                        disabled={!template}
                      >
                        <Eye className="h-4 w-4" />
                      </ActionBtn>
                      {canEdit && (
                        <>
                          <ActionBtn title="Editar estudio" onClick={() => onEditStudy(study)}>
                            <Pencil className="h-4 w-4" />
                          </ActionBtn>
                          <ActionBtn title="Crear plantilla para estudio" onClick={() => onCreateTemplate(study)}>
                            <Plus className="h-4 w-4" />
                          </ActionBtn>
                          <ActionBtn
                            title={study.isActive === false ? 'Activar' : 'Desactivar'}
                            onClick={() => onToggleActive(study)}
                          >
                            <Power className="h-4 w-4" />
                          </ActionBtn>
                        </>
                      )}
                      <ActionBtn title="Plantilla" onClick={() => onViewTemplate(study)}>
                        <FileText className="h-4 w-4" />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActionBtn({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg p-2 text-clinic-text/60 hover:bg-clinic-bg hover:text-clinic-blue disabled:opacity-40"
    >
      {children}
    </button>
  )
}
