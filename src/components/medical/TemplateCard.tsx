import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Copy, Eye, FileText, Layers, Pencil, Power, Trash2 } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import type { ReportTemplate } from '@/types/medical'
import { getFormatTypeLabel, isTemplateComplete } from '@/utils/templateCatalog'

interface TemplateCardProps {
  template: ReportTemplate
  isDefault: boolean
  studyName: string
  specialtyName?: string
  canEdit: boolean
  onPreview: () => void
  onEdit: () => void
  onDuplicate: () => void
  onToggleActive: () => void
  onDelete?: () => void
  onSetDefault?: () => void
}

export default function TemplateCard({
  template,
  isDefault,
  studyName,
  specialtyName,
  canEdit,
  onPreview,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
  onSetDefault,
}: TemplateCardProps) {
  const isInactive = template.isActive === false
  const isIncomplete = !isTemplateComplete(template)
  const FormatIcon = template.formatType === 'structured' ? Layers : FileText

  return (
    <article
      className={clsx(
        'flex flex-col rounded-xl border bg-clinic-white p-5 shadow-sm transition hover:shadow-md',
        isIncomplete ? 'border-amber-200' : 'border-clinic-sky/50',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinic-blue/10 text-clinic-blue">
          <FormatIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-wrap gap-1">
          <StatusBadge
            label={template.formatType === 'structured' ? 'Estructurada' : 'Narrativa'}
            variant={template.formatType === 'structured' ? 'info' : 'purple'}
          />
          {isIncomplete && (
            <StatusBadge label="Incompleta" variant="warning" />
          )}
          {isInactive && <StatusBadge label="Inactiva" variant="neutral" />}
          <StatusBadge label={isDefault ? 'Predeterminada' : 'Alternativa'} variant={isDefault ? 'success' : 'neutral'} />
        </div>
      </div>

      <h3 className="mt-4 font-semibold text-clinic-deep-blue">{template.name}</h3>
      <p className="mt-1 text-sm text-clinic-text/70">{studyName}</p>
      <p className="text-xs text-clinic-text/50">{specialtyName ?? '—'}</p>

      <ul className="mt-4 space-y-1 text-xs text-clinic-text/80">
        <li>{getFormatTypeLabel(template.formatType)}</li>
        <li>{template.sections.length} sección(es)</li>
        <li className="font-mono text-clinic-blue">{template.id}</li>
        {template.updatedAt && (
          <li>
            Actualizado:{' '}
            {new Date(template.updatedAt).toLocaleDateString('es-PE')}
          </li>
        )}
      </ul>

      {template.sections.length === 0 && (
        <p className="mt-3 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
          Esta plantilla aún no tiene secciones configuradas.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-clinic-sky/40 pt-4">
        <CardBtn onClick={onPreview}>
          <Eye className="h-3.5 w-3.5" />
          Vista previa
        </CardBtn>
        {canEdit && (
          <>
            <CardBtn onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </CardBtn>
            <CardBtn onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5" />
              Duplicar
            </CardBtn>
            <CardBtn onClick={onToggleActive}>
              <Power className="h-3.5 w-3.5" />
              {isInactive ? 'Activar' : 'Desactivar'}
            </CardBtn>
            {onSetDefault && (
              <CardBtn onClick={onSetDefault}>
                {isDefault ? 'Predeterminada' : 'Marcar predeterminada'}
              </CardBtn>
            )}
            {onDelete && (
              <CardBtn onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </CardBtn>
            )}
          </>
        )}
      </div>
    </article>
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
