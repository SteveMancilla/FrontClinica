import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import type {
  ReportTemplate,
  ReportTemplateSection,
  Specialty,
  Study,
} from '@/types/medical'
import SectionEditModal, {
  type SectionFormData,
} from '@/components/medical/SectionEditModal'
import { resolveTemplateForStudy } from '@/utils/templateCatalog'
import { getStudyBlock, getStudyBlockOptions, type StudyBlock } from '@/utils/studyGrouping'

export type TemplateEditorMode = 'create' | 'edit'

interface TemplateEditorDrawerProps {
  isOpen: boolean
  mode: TemplateEditorMode
  template: ReportTemplate | null
  initialStudyId?: string | null
  studies: Study[]
  templates: ReportTemplate[]
  specialties: Specialty[]
  canEdit: boolean
  onClose: () => void
  onSave: (template: ReportTemplate) => void
  onPreview: (template: ReportTemplate) => void
}

export default function TemplateEditorDrawer({
  isOpen,
  mode,
  template,
  initialStudyId,
  studies,
  templates,
  specialties: _specialties,
  canEdit,
  onClose,
  onSave,
  onPreview,
}: TemplateEditorDrawerProps) {
  const [draft, setDraft] = useState<ReportTemplate | null>(null)
  const [sectionModalOpen, setSectionModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<SectionFormData | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [groupFilter, setGroupFilter] = useState<'all' | StudyBlock>('all')

  useEffect(() => {
    if (!isOpen) return
    if (mode === 'edit' && template) {
      setDraft(structuredClone(template))
      setErrors({})
      const linked = studies.find((study) => study.id === template.studyId)
      setGroupFilter(linked ? getStudyBlock(linked) : 'all')
      return
    }

    const preselectedStudy = studies.find((study) => study.id === initialStudyId) ?? studies[0]
    const baseTemplate = preselectedStudy
      ? resolveTemplateForStudy(preselectedStudy, templates)
      : undefined
    setDraft({
      id: `tmp-${Date.now()}`,
      studyId: preselectedStudy?.id ?? '',
      name: '',
      formatType: preselectedStudy?.formatType ?? 'structured',
      description: '',
      isActive: false,
      sections: baseTemplate ? structuredClone(baseTemplate.sections) : [],
      isComplete: Boolean(baseTemplate?.sections.length),
      updatedAt: new Date().toISOString(),
    })
    setErrors({})
    setGroupFilter(preselectedStudy ? getStudyBlock(preselectedStudy) : 'all')
  }, [isOpen, mode, template, studies, initialStudyId, templates])

  if (!isOpen || !draft) return null

  const sortedSections = [...draft.sections].sort((a, b) => a.order - b.order)
  const linkedStudy = studies.find((s) => s.id === draft.studyId)
  const groupOptions = getStudyBlockOptions(studies)
  const availableStudies =
    groupFilter === 'all'
      ? studies
      : studies.filter((study) => getStudyBlock(study) === groupFilter)
  const sortedAvailableStudies = [...availableStudies].sort((a, b) =>
    a.name.localeCompare(b.name, 'es'),
  )

  const updateDraft = (patch: Partial<ReportTemplate>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...sortedSections]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const a = next[index]
    const b = next[target]
    next[index] = { ...b, order: a.order }
    next[target] = { ...a, order: b.order }
    updateDraft({ sections: next })
  }

  const saveSection = (data: SectionFormData) => {
    const section: ReportTemplateSection = {
      id: data.id,
      title: data.title,
      order: data.order,
      baseText: data.baseText,
      isRequired: data.isRequired,
      voiceEnabled: data.voiceEnabled,
    }
    const exists = draft.sections.some((s) => s.id === section.id)
    const sections = exists
      ? draft.sections.map((s) => (s.id === section.id ? section : s))
      : [...draft.sections, section]
    updateDraft({ sections })
    setSectionModalOpen(false)
    setEditingSection(null)
  }

  const deleteSection = (id: string) => {
    updateDraft({ sections: draft.sections.filter((s) => s.id !== id) })
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}
    if (!draft.name.trim()) {
      nextErrors.name = 'El nombre de plantilla es obligatorio.'
    }
    if (!draft.studyId) {
      nextErrors.studyId = 'Debe seleccionar un estudio asociado.'
    }
    if (!draft.formatType) {
      nextErrors.formatType = 'Debe seleccionar un tipo de formato.'
    }
    if (draft.sections.length === 0) {
      nextErrors.sections =
        draft.formatType === 'narrative'
          ? 'La plantilla narrativa debe tener al menos una sección principal.'
          : 'La plantilla estructurada debe tener al menos una sección.'
    }
    if (draft.isActive !== false && draft.sections.length === 0) {
      nextErrors.status = 'Una plantilla activa/predeterminada debe tener secciones.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      ...draft,
      name: draft.name.trim(),
      description: draft.description?.trim() || undefined,
      updatedAt: new Date().toISOString(),
      isComplete: draft.sections.length > 0,
    })
  }

  const title = mode === 'create' ? 'Nueva plantilla' : 'Editar plantilla'
  const subtitle =
    mode === 'create'
      ? 'Crea un nuevo formato de informe asociado a un estudio.'
      : 'Modifica la estructura, secciones y datos de esta plantilla.'

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-clinic-deep-blue/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-clinic-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-clinic-sky/60 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-clinic-deep-blue">{title}</h2>
            <p className="text-xs text-clinic-text/60">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-clinic-bg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Nombre</span>
              <input
                value={draft.name}
                disabled={!canEdit}
                onChange={(e) => updateDraft({ name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm disabled:bg-clinic-bg"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </label>
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Grupo de estudio</span>
              <select
                value={groupFilter}
                disabled={!canEdit}
                onChange={(e) => {
                  const nextGroup = e.target.value as 'all' | StudyBlock
                  setGroupFilter(nextGroup)
                  if (nextGroup !== 'all') {
                    const first = studies.find((study) => getStudyBlock(study) === nextGroup)
                    if (first) {
                      const base = resolveTemplateForStudy(first, templates)
                      updateDraft({
                        studyId: first.id,
                        formatType: first.formatType,
                        sections:
                          mode === 'create' && base
                            ? structuredClone(base.sections)
                            : draft.sections,
                      })
                    }
                  }
                }}
                className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm disabled:bg-clinic-bg"
              >
                <option value="all">Todos los grupos</option>
                {groupOptions.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Estudio asociado</span>
              <select
                value={draft.studyId}
                disabled={!canEdit}
                onChange={(e) => {
                  const study = studies.find((s) => s.id === e.target.value)
                  const base = study
                    ? resolveTemplateForStudy(study, templates)
                    : undefined
                  updateDraft({
                    studyId: e.target.value,
                    formatType: study?.formatType ?? draft.formatType,
                    sections:
                      mode === 'create' && base
                        ? structuredClone(base.sections)
                        : draft.sections,
                  })
                }}
                className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm disabled:bg-clinic-bg"
              >
                <option value="">Seleccionar estudio</option>
                {sortedAvailableStudies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.studyId && <p className="mt-1 text-xs text-red-600">{errors.studyId}</p>}
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-clinic-deep-blue">Especialidad</span>
              <input
                readOnly
                value={linkedStudy?.specialtyName ?? '—'}
                className="mt-1 w-full rounded-lg border border-clinic-sky/40 bg-clinic-bg/50 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Tipo de formato</span>
              <select
                value={draft.formatType}
                disabled={!canEdit}
                onChange={(e) =>
                  updateDraft({
                    formatType: e.target.value as ReportTemplate['formatType'],
                  })
                }
                className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
              >
                <option value="structured">Estructurado por secciones</option>
                <option value="narrative">Narrativo</option>
              </select>
              {errors.formatType && <p className="mt-1 text-xs text-red-600">{errors.formatType}</p>}
            </label>
            <label className="block text-sm">
              <span className="font-medium text-clinic-deep-blue">Estado</span>
              <select
                value={draft.isActive === false ? 'inactive' : 'active'}
                disabled={!canEdit}
                onChange={(e) =>
                  updateDraft({ isActive: e.target.value === 'active' })
                }
                className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
              {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-clinic-deep-blue">Predeterminada para este estudio</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-clinic-sky/60 px-3 py-2">
                <input
                  type="checkbox"
                  checked={draft.isActive !== false}
                  disabled={!canEdit}
                  onChange={(e) => updateDraft({ isActive: e.target.checked })}
                />
                <span className="text-sm text-clinic-text">
                  Usar esta plantilla automáticamente en nuevas atenciones
                </span>
              </div>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-clinic-deep-blue">Descripción</span>
              <textarea
                value={draft.description ?? ''}
                disabled={!canEdit}
                onChange={(e) => updateDraft({ description: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-clinic-deep-blue">Secciones</h3>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(null)
                    setSectionModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-clinic-teal px-3 py-1.5 text-xs font-semibold text-clinic-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar sección
                </button>
              )}
            </div>

            {sortedSections.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Esta plantilla aún no tiene secciones configuradas.
              </p>
            ) : (
              <ul className="space-y-3">
                {sortedSections.map((section, index) => (
                  <li
                    key={section.id}
                    className="rounded-lg border border-clinic-sky/50 bg-clinic-bg/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs text-clinic-text/50">#{section.order}</span>
                        <p className="font-medium text-clinic-deep-blue">{section.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-clinic-text/70">
                          {section.baseText}
                        </p>
                        <p className="mt-1 text-[10px] text-clinic-teal">
                          {section.isRequired ? 'Requerida' : 'Opcional'} ·{' '}
                          {section.voiceEnabled ? 'Voz ON' : 'Voz OFF'}
                        </p>
                      </div>
                      {canEdit && (
                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            type="button"
                            title="Subir"
                            onClick={() => moveSection(index, -1)}
                            className="rounded p-1 hover:bg-clinic-white"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Bajar"
                            onClick={() => moveSection(index, 1)}
                            className="rounded p-1 hover:bg-clinic-white"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSection(section)
                              setSectionModalOpen(true)
                            }}
                            className="rounded px-2 py-0.5 text-xs text-clinic-blue"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSection(section.id)}
                            className="rounded p-1 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {errors.sections && <p className="mt-2 text-xs text-red-600">{errors.sections}</p>}
          </section>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-clinic-sky/60 p-4">
          <button
            type="button"
            onClick={() => onPreview(draft)}
            className="inline-flex items-center gap-1 rounded-lg border border-clinic-sky px-4 py-2 text-sm"
          >
            <Eye className="h-4 w-4" />
            Vista previa
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-clinic-sky px-4 py-2 text-sm"
          >
            Cancelar
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={handleSave}
              className="ml-auto inline-flex items-center gap-1 rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white"
            >
              <Save className="h-4 w-4" />
              {mode === 'create' ? 'Crear plantilla' : 'Guardar cambios'}
            </button>
          )}
        </div>
      </aside>

      <SectionEditModal
        isOpen={sectionModalOpen}
        initial={editingSection}
        nextOrder={draft.sections.length + 1}
        onClose={() => {
          setSectionModalOpen(false)
          setEditingSection(null)
        }}
        onSave={saveSection}
      />
    </>
  )
}
