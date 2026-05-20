import { Eye, FileText, Pencil, Plus, X } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import type { ReportTemplate, Study } from '@/types/medical'
import {
  getDefaultTemplateForStudy,
  getDictationModeLabel,
  getFormatTypeLabel,
  getSpecialtyName,
  getStudyCatalogStatus,
  resolveTemplatesForStudy,
  studyCatalogStatusLabels,
  studyCatalogStatusVariants,
} from '@/utils/templateCatalog'

interface StudyDetailPanelProps {
  study: Study
  templates: ReportTemplate[]
  canEdit: boolean
  onClose: () => void
  onEditStudy: () => void
  onNewTemplate: () => void
  onEditTemplate: (template: ReportTemplate) => void
  onPreview: () => void
}

export default function StudyDetailPanel({
  study,
  templates,
  canEdit,
  onClose,
  onEditStudy,
  onNewTemplate,
  onEditTemplate,
  onPreview,
}: StudyDetailPanelProps) {
  const activeTemplate = getDefaultTemplateForStudy(study, templates)
  const studyTemplates = resolveTemplatesForStudy(study, templates)
  const status = getStudyCatalogStatus(study, templates)

  return (
    <aside className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-clinic-deep-blue">Detalle del estudio</h3>
        <button type="button" onClick={onClose} className="rounded p-1 hover:bg-clinic-bg lg:hidden">
          <X className="h-4 w-4" />
        </button>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <Item label="Estudio" value={study.name} />
        <Item label="Bloque" value={study.block ?? '—'} />
        <Item label="Especialidad" value={study.specialtyName ?? getSpecialtyName(study.specialtyId)} />
        <Item
          label="Plantilla predeterminada"
          value={activeTemplate?.name ?? 'Sin plantilla predeterminada'}
        />
        <Item label="Total de plantillas asociadas" value={String(studyTemplates.length)} />
        <Item label="Formato" value={getFormatTypeLabel(study.formatType)} />
        <Item label="Dictado" value={getDictationModeLabel(study.formatType)} />
        <Item
          label="Secciones (activa)"
          value={activeTemplate ? String(activeTemplate.sections.length) : '—'}
        />
        <Item
          label="Última actualización"
          value={
            activeTemplate?.updatedAt
              ? new Date(activeTemplate.updatedAt).toLocaleString('es-PE')
              : '—'
          }
        />
        <div>
          <dt className="text-xs text-clinic-text/50">Estado</dt>
          <dd className="mt-1">
            <StatusBadge
              label={studyCatalogStatusLabels[status]}
              variant={studyCatalogStatusVariants[status]}
            />
          </dd>
        </div>
      </dl>

      {studyTemplates.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-clinic-text/60">Plantillas de este estudio</p>
          <ul className="mt-2 space-y-1.5">
            {studyTemplates.map((tpl) => (
              <li
                key={tpl.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-clinic-sky/50 px-2 py-1.5 text-xs"
              >
                <span className="truncate font-medium text-clinic-deep-blue">{tpl.name}</span>
                <div className="flex shrink-0 items-center gap-1">
                  {tpl.id === activeTemplate?.id && (
                    <StatusBadge label="Activa" variant="success" />
                  )}
                  {tpl.isActive === false && tpl.id !== activeTemplate?.id && (
                    <StatusBadge label="Inactiva" variant="neutral" />
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onEditTemplate(tpl)}
                      className="rounded p-1 text-clinic-blue hover:bg-clinic-bg"
                      title="Editar plantilla"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!activeTemplate && studyTemplates.length === 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Este estudio no tiene plantillas. Cree una y actívela para usarla en las atenciones.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onPreview}
          disabled={!activeTemplate}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-clinic-sky px-3 py-2 text-sm font-medium text-clinic-text hover:bg-clinic-bg disabled:opacity-50"
        >
          <Eye className="h-4 w-4" />
          Vista previa
        </button>
        {canEdit && (
          <>
            <button
              type="button"
              onClick={onEditStudy}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-clinic-sky px-3 py-2 text-sm font-medium text-clinic-text hover:bg-clinic-bg"
            >
              <Pencil className="h-4 w-4" />
              Editar estudio
            </button>
            <button
              type="button"
              onClick={onNewTemplate}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-clinic-teal/50 bg-clinic-sky/20 px-3 py-2 text-sm font-medium text-clinic-deep-blue hover:bg-clinic-sky/40"
            >
              <Plus className="h-4 w-4" />
              Nueva plantilla
            </button>
            <button
              type="button"
              onClick={() => activeTemplate && onEditTemplate(activeTemplate)}
              disabled={!activeTemplate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-blue px-3 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              Editar plantilla activa
            </button>
          </>
        )}
        {!canEdit && (
          <p className="text-center text-xs text-clinic-text/50">
            <FileText className="mx-auto mb-1 h-4 w-4" />
            Solo consulta — sin permisos de edición
          </p>
        )}
      </div>
    </aside>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-clinic-text/50">{label}</dt>
      <dd className="mt-0.5 font-medium text-clinic-deep-blue">{value}</dd>
    </div>
  )
}
