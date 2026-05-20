import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'
import {
  Eye,
  FileStack,
  FileText,
  Info,
  Layers,
  ListTree,
  Plus,
  Search,
} from 'lucide-react'
import StudyDetailPanel from '@/components/medical/StudyDetailPanel'
import StudyEditorDrawer, {
  type StudyFormValues,
} from '@/components/medical/StudyEditorDrawer'
import StudyTable from '@/components/medical/StudyTable'
import TemplateCard from '@/components/medical/TemplateCard'
import TemplateEditorDrawer, {
  type TemplateEditorMode,
} from '@/components/medical/TemplateEditorDrawer'
import TemplatePreview from '@/components/medical/TemplatePreview'
import PageHeader from '@/components/layout/PageHeader'
import SummaryCard from '@/components/ui/SummaryCard'
import { ApiError, formatApiErrorMessage } from '@/services/apiClient'
import { getCurrentUser } from '@/services/authService'
import {
  createReportTemplate,
  deleteReportTemplate,
  getReportTemplates,
  updateReportTemplate,
} from '@/services/reportTemplateService'
import { getSpecialties, type SpecialtyOption } from '@/services/specialtyService'
import { createStudy, getStudies, updateStudy } from '@/services/studyService'
import type { ReportTemplate, Study, StudyFormatType } from '@/types/medical'
import {
  getDefaultTemplateForStudy,
  getStudyCatalogStatus,
  getTemplateSummary,
  isTemplateComplete,
  resolveTemplateForStudy,
} from '@/utils/templateCatalog'
import {
  getStudyBlock,
  getStudyBlockOptions,
  type StudyBlock,
} from '@/utils/studyGrouping'

type MainTab = 'studies' | 'templates' | 'sections'

type StudyStatusFilter =
  | 'all'
  | 'active'
  | 'inactive'
  | 'no_template'
  | 'incomplete'

const tabs: { id: MainTab; label: string }[] = [
  { id: 'studies', label: 'Estudios' },
  { id: 'templates', label: 'Plantillas' },
  { id: 'sections', label: 'Configuración de secciones' },
]

export default function TemplatesPage() {
  const user = getCurrentUser()
  const canEdit = user?.role === 'admin'

  const [studies, setStudies] = useState<Study[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [catalogSpecialties, setCatalogSpecialties] = useState<SpecialtyOption[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'success'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reloadCatalog = useCallback(async () => {
    const [studiesData, templatesData, specialtiesData] = await Promise.all([
      getStudies(true),
      getReportTemplates(true),
      getSpecialties(),
    ])
    setStudies(studiesData)
    setTemplates(templatesData)
    setCatalogSpecialties(specialtiesData)
    return { studiesData, templatesData }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoadState('loading')
      setLoadError(null)
      try {
        const { studiesData } = await reloadCatalog()
        setSelectedStudyId(studiesData[0]?.id ?? null)
        setLoadState('success')
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : 'No se pudieron cargar estudios y plantillas.',
        )
        setLoadState('error')
      }
    }
    void load()
  }, [reloadCatalog])

  const [activeTab, setActiveTab] = useState<MainTab>('studies')
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(
    studies[0]?.id ?? null,
  )

  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState<'all' | StudyFormatType>('all')
  const [statusFilter, setStatusFilter] = useState<StudyStatusFilter>('all')
  const [templateSearch, setTemplateSearch] = useState('')
  const [studyBlockFilter, setStudyBlockFilter] = useState<'all' | StudyBlock>('all')

  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null)
  const [previewStudy, setPreviewStudy] = useState<Study | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<TemplateEditorMode>('create')
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null)
  const [newTemplateStudyId, setNewTemplateStudyId] = useState<string | null>(null)
  const [studyEditorOpen, setStudyEditorOpen] = useState(false)
  const [editingStudy, setEditingStudy] = useState<Study | null>(null)

  const summary = useMemo(
    () => getTemplateSummary(studies, templates),
    [studies, templates],
  )

  const specialties = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    catalogSpecialties.forEach((s) => map.set(s.id, s))
    studies.forEach((s) => {
      if (s.specialtyId && s.specialtyName) {
        map.set(s.specialtyId, { id: s.specialtyId, name: s.specialtyName })
      }
    })
    return [...map.values()]
  }, [studies, catalogSpecialties])

  const selectedStudy = studies.find((s) => s.id === selectedStudyId) ?? null

  const filteredStudies = useMemo(() => {
    return studies.filter((study) => {
      if (search && !study.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (specialtyFilter !== 'all' && study.specialtyId !== specialtyFilter) {
        return false
      }
      if (formatFilter !== 'all' && study.formatType !== formatFilter) {
        return false
      }
      if (studyBlockFilter !== 'all' && getStudyBlock(study) !== studyBlockFilter) {
        return false
      }
      if (statusFilter !== 'all') {
        const status = getStudyCatalogStatus(study, templates)
        if (statusFilter === 'active' && status !== 'active') return false
        if (statusFilter === 'inactive' && status !== 'inactive') return false
        if (statusFilter === 'no_template' && status !== 'no_template') return false
        if (
          statusFilter === 'incomplete' &&
          status !== 'incomplete' &&
          status !== 'template_not_found'
        ) {
          return false
        }
      }
      return true
    })
  }, [
    studies,
    templates,
    search,
    specialtyFilter,
    formatFilter,
    studyBlockFilter,
    statusFilter,
  ])

  const blockOptions = useMemo(() => getStudyBlockOptions(studies), [studies])

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      if (!templateSearch) return true
      const q = templateSearch.toLowerCase()
      const study = studies.find((s) => s.id === tpl.studyId)
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.id.toLowerCase().includes(q) ||
        (study?.name.toLowerCase().includes(q) ?? false)
      )
    })
  }, [templates, templateSearch, studies])

  const allSections = useMemo(() => {
    return templates.flatMap((tpl) => {
      const study = studies.find((s) => s.id === tpl.studyId)
      return [...tpl.sections]
        .sort((a, b) => a.order - b.order)
        .map((sec) => ({
          templateId: tpl.id,
          templateName: tpl.name,
          studyName: study?.name ?? '—',
          ...sec,
        }))
    })
  }, [templates, studies])

  const openPreview = (template: ReportTemplate, study?: Study | null) => {
    setPreviewTemplate(template)
    setPreviewStudy(study ?? studies.find((s) => s.id === template.studyId) ?? null)
    setPreviewOpen(true)
  }

  const openEditor = (template: ReportTemplate, mode: TemplateEditorMode = 'edit') => {
    setEditorMode(mode)
    setEditingTemplate(mode === 'edit' ? template : null)
    setNewTemplateStudyId(mode === 'create' ? template.studyId : null)
    setEditorOpen(true)
  }

  const runAction = async (fn: () => Promise<void>, successMsg: string) => {
    setSaving(true)
    setActionMessage(null)
    try {
      await fn()
      await reloadCatalog()
      setActionMessage(successMsg)
    } catch (error) {
      const message =
        error instanceof ApiError ? formatApiErrorMessage(error) : 'No se pudo completar la acción.'
      setActionMessage(message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTemplate = async (updated: ReportTemplate) => {
    if (!canEdit) return
    const isNew = editorMode === 'create'
    setSaving(true)
    setActionMessage(null)
    try {
      if (isNew) {
        await createReportTemplate({
          studyId: updated.studyId,
          name: updated.name,
          formatType: updated.formatType,
          description: updated.description,
          status: updated.isActive === false ? 'inactive' : 'active',
          activate: updated.isActive !== false,
          sections: updated.sections,
        })
      } else {
        await updateReportTemplate(updated.id, {
          studyId: updated.studyId,
          name: updated.name,
          formatType: updated.formatType,
          description: updated.description,
          status: updated.isActive === false ? 'inactive' : 'active',
          activate: updated.isActive !== false,
          sections: updated.sections,
        })
      }
      await reloadCatalog()
      setEditorOpen(false)
      setEditingTemplate(null)
      setNewTemplateStudyId(null)
      setActionMessage('Plantilla guardada correctamente.')
    } catch (error) {
      const message =
        error instanceof ApiError ? formatApiErrorMessage(error) : 'No se pudo guardar la plantilla.'
      setActionMessage(message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStudy = (study: Study) => {
    if (!canEdit) return
    const nextStatus = study.isActive === false ? 'active' : 'inactive'
    void runAction(async () => {
      await updateStudy(study.id, {
        specialtyId: study.specialtyId,
        name: study.name,
        block: study.block ?? 'Ecografía general',
        formatType: study.formatType,
        status: nextStatus,
      })
    }, nextStatus === 'active' ? 'Estudio activado.' : 'Estudio desactivado.')
  }

  const handleToggleTemplate = (template: ReportTemplate) => {
    if (!canEdit) return
    const activating = template.isActive === false
    void runAction(async () => {
      await updateReportTemplate(template.id, {
        studyId: template.studyId,
        name: template.name,
        formatType: template.formatType,
        description: template.description,
        status: activating ? 'active' : 'inactive',
        activate: activating,
        sections: template.sections,
      })
    }, activating ? 'Plantilla activada para este estudio.' : 'Plantilla desactivada.')
  }

  const handleDeleteTemplate = (template: ReportTemplate) => {
    if (!canEdit) return
    const sameStudy = templates.filter((tpl) => tpl.studyId === template.studyId)
    const activeInStudy = sameStudy.filter((tpl) => tpl.isActive !== false)
    if (template.isActive !== false && activeInStudy.length <= 1) {
      setActionMessage(
        'No puede eliminar la única plantilla predeterminada del estudio. Cree/active otra primero.',
      )
      return
    }
    const warning =
      template.isActive !== false
        ? 'Esta plantilla es predeterminada. Si la elimina, el estudio quedará sin plantilla automática.'
        : ''
    if (
      !window.confirm(
        `Eliminar plantilla\n\n¿Deseas eliminar esta plantilla? Esta acción no eliminará el estudio asociado.\n\n${warning}`,
      )
    ) {
      return
    }
    void runAction(async () => {
      await deleteReportTemplate(template.id)
    }, 'Plantilla eliminada.')
  }

  const handleDuplicateTemplate = (template: ReportTemplate) => {
    if (!canEdit) return
    void runAction(async () => {
      await createReportTemplate({
        studyId: template.studyId,
        name: `Copia de ${template.name}`,
        formatType: template.formatType,
        description: template.description,
        status: 'inactive',
        sections: template.sections,
      })
    }, 'Plantilla duplicada como borrador inactivo.')
  }

  const handleNewStudy = () => {
    if (!canEdit) return
    setEditingStudy(null)
    setStudyEditorOpen(true)
    setActiveTab('studies')
  }

  const handleSaveStudy = (values: StudyFormValues) => {
    if (!canEdit) return
    void runAction(async () => {
      if (editingStudy) {
        await updateStudy(editingStudy.id, {
          specialtyId: values.specialtyId,
          name: values.name,
          block: values.block,
          formatType: values.formatType,
          status: values.status,
        })
      } else {
        const created = await createStudy({
          specialtyId: values.specialtyId,
          name: values.name,
          block: values.block,
          formatType: values.formatType,
          status: values.status,
        })
        setSelectedStudyId(created.id)
      }
      setStudyEditorOpen(false)
      setEditingStudy(null)
    }, editingStudy ? 'Estudio actualizado.' : 'Estudio creado. Ahora puede agregar una plantilla.')
  }

  const handleNewTemplate = (forStudy?: Study | null) => {
    if (!canEdit) return
    const study = forStudy ?? selectedStudy ?? studies[0]
    if (!study) {
      setActionMessage('Primero cree o seleccione un estudio.')
      return
    }
    if (!/^\d+$/.test(study.id)) {
      setActionMessage('Guarde el estudio en el servidor antes de crear la plantilla.')
      return
    }
    setSelectedStudyId(study.id)
    setEditorMode('create')
    setEditingTemplate(null)
    setNewTemplateStudyId(study.id)
    setEditorOpen(true)
  }

  const handlePreviewFromHeader = () => {
    const tpl =
      (selectedStudy && resolveTemplateForStudy(selectedStudy, templates)) ??
      templates[0]
    if (tpl) openPreview(tpl, selectedStudy)
  }

  const handleSetDefaultTemplate = (template: ReportTemplate) => {
    if (!canEdit) return
    if (!isTemplateComplete(template)) {
      setActionMessage('Complete secciones antes de marcarla como predeterminada.')
      return
    }
    void runAction(async () => {
      await updateReportTemplate(template.id, {
        studyId: template.studyId,
        name: template.name,
        formatType: template.formatType,
        description: template.description,
        status: 'active',
        activate: true,
        sections: template.sections,
      })
    }, 'Plantilla marcada como predeterminada.')
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Configura los formatos de informe que se asignarán automáticamente a cada estudio.">
          {canEdit && (
            <>
              <HeaderBtn onClick={handleNewStudy}>
                <Plus className="h-4 w-4" />
                Nuevo estudio
              </HeaderBtn>
              <HeaderBtn onClick={() => handleNewTemplate()}>
                <Plus className="h-4 w-4" />
                Nueva plantilla
              </HeaderBtn>
            </>
          )}
        <HeaderBtn onClick={handlePreviewFromHeader} variant="primary">
          <Eye className="h-4 w-4" />
          Vista previa
        </HeaderBtn>
      </PageHeader>

      {loadState === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-clinic-text/70">
          <Loader2 className="h-5 w-5 animate-spin text-clinic-blue" />
          Cargando catálogo desde el servidor…
        </div>
      )}

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      {actionMessage && (
        <p
          className={clsx(
            'rounded-lg border px-4 py-3 text-sm',
            actionMessage.includes('No se') || actionMessage.includes('error')
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-clinic-teal/40 bg-clinic-sky/30 text-clinic-deep-blue',
          )}
        >
          {actionMessage}
        </p>
      )}

      {loadState === 'success' && (
        <>
      <div className="flex gap-3 rounded-xl border border-clinic-teal/30 bg-clinic-sky/20 px-4 py-3 text-sm text-clinic-deep-blue">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-clinic-teal" />
        <p>
          Cada atención usa el tipo de estudio para cargar automáticamente su plantilla de
          informe. Las plantillas estructuradas se dictan por secciones; las narrativas
          usan un campo principal de hallazgos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total de estudios"
          value={summary.totalStudies}
          icon={<FileStack className="h-5 w-5" />}
        />
        <SummaryCard
          title="Plantillas activas"
          value={summary.activeTemplates}
          icon={<FileText className="h-5 w-5" />}
          accent="success"
        />
        <SummaryCard
          title="Formatos estructurados"
          value={summary.structured}
          icon={<Layers className="h-5 w-5" />}
          accent="info"
        />
        <SummaryCard
          title="Formatos narrativos"
          value={summary.narrative}
          icon={<ListTree className="h-5 w-5" />}
          accent="purple"
        />
        <SummaryCard
          title="Plantillas incompletas"
          value={summary.incomplete}
          icon={<FileText className="h-5 w-5" />}
          accent="warning"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-clinic-sky/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'rounded-t-lg px-4 py-2.5 text-sm font-medium transition',
              activeTab === tab.id
                ? 'border-b-2 border-clinic-blue bg-clinic-white text-clinic-deep-blue'
                : 'text-clinic-text/60 hover:text-clinic-deep-blue',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'studies' && (
        <>
          <FiltersBar>
            <FilterInput
              icon={<Search className="h-4 w-4 text-clinic-text/40" />}
              value={search}
              onChange={setSearch}
              placeholder="Buscar estudio..."
            />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm"
            >
              <option value="all">Todas las especialidades</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={formatFilter}
              onChange={(e) =>
                setFormatFilter(e.target.value as 'all' | StudyFormatType)
              }
              className="rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm"
            >
              <option value="all">Todos los formatos</option>
              <option value="structured">Estructurado</option>
              <option value="narrative">Narrativo</option>
            </select>
            <select
              value={studyBlockFilter}
              onChange={(e) => setStudyBlockFilter(e.target.value as 'all' | StudyBlock)}
              className="rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm"
            >
              <option value="all">Todos los bloques</option>
              {blockOptions.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StudyStatusFilter)}
              className="rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="no_template">Sin plantilla</option>
              <option value="incomplete">Plantilla incompleta</option>
            </select>
          </FiltersBar>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <StudyTable
              studies={filteredStudies}
              templates={templates}
              selectedStudyId={selectedStudyId}
              canEdit={canEdit}
              onSelect={setSelectedStudyId}
              onViewTemplate={(study) => {
                const tpl = resolveTemplateForStudy(study, templates)
                if (tpl) openPreview(tpl, study)
              }}
              onCreateTemplate={(study) => handleNewTemplate(study)}
              onEditStudy={(study) => {
                setEditingStudy(study)
                setStudyEditorOpen(true)
              }}
              onToggleActive={handleToggleStudy}
            />
            {selectedStudy ? (
              <StudyDetailPanel
                study={selectedStudy}
                templates={templates}
                canEdit={canEdit}
                onClose={() => setSelectedStudyId(null)}
                onEditStudy={() => {
                  setEditingStudy(selectedStudy)
                  setStudyEditorOpen(true)
                }}
                onNewTemplate={() => handleNewTemplate(selectedStudy)}
                onEditTemplate={(tpl) => openEditor(tpl, 'edit')}
                onPreview={() => {
                  const tpl = resolveTemplateForStudy(selectedStudy, templates)
                  if (tpl) openPreview(tpl, selectedStudy)
                }}
              />
            ) : (
              <div className="hidden rounded-xl border border-dashed border-clinic-sky/60 bg-clinic-white p-8 text-center text-sm text-clinic-text/50 lg:block">
                Seleccione un estudio para ver el detalle.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'templates' && (
        <>
          <FiltersBar>
            <FilterInput
              icon={<Search className="h-4 w-4 text-clinic-text/40" />}
              value={templateSearch}
              onChange={setTemplateSearch}
              placeholder="Buscar plantilla o estudio..."
            />
          </FiltersBar>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((tpl) => {
              const study = studies.find((s) => s.id === tpl.studyId)
              const defaultTemplate = study
                ? getDefaultTemplateForStudy(study, templates)
                : undefined
              return (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  isDefault={defaultTemplate?.id === tpl.id}
                  studyName={study?.name ?? 'Estudio no vinculado'}
                  specialtyName={study?.specialtyName}
                  canEdit={canEdit}
                  onPreview={() => openPreview(tpl, study ?? null)}
                  onEdit={() => openEditor(tpl, 'edit')}
                  onDuplicate={() => handleDuplicateTemplate(tpl)}
                  onToggleActive={() => handleToggleTemplate(tpl)}
                  onDelete={() => handleDeleteTemplate(tpl)}
                  onSetDefault={() => handleSetDefaultTemplate(tpl)}
                />
              )
            })}
          </div>
          {filteredTemplates.length === 0 && (
            <EmptyState text="No hay plantillas que coincidan con la búsqueda." />
          )}
        </>
      )}

      {activeTab === 'sections' && (
        <div className="overflow-hidden rounded-xl border border-clinic-sky/50 bg-clinic-white shadow-sm">
          <div className="border-b border-clinic-sky/60 bg-clinic-bg/40 px-4 py-3">
            <h2 className="font-semibold text-clinic-deep-blue">
              Configuración de secciones
            </h2>
            <p className="text-xs text-clinic-text/60">
              Vista consolidada de todas las secciones por plantilla. Edite desde el
              editor de plantilla.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-clinic-sky/60 bg-clinic-bg/30">
                  {[
                    'Plantilla',
                    'Estudio',
                    'Sección',
                    'Orden',
                    'Requerida',
                    'Dictado',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-semibold text-clinic-deep-blue"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-sky/40">
                {allSections.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-clinic-text/50"
                    >
                      No hay secciones configuradas en ninguna plantilla.
                    </td>
                  </tr>
                ) : (
                  allSections.map((row) => (
                    <tr key={`${row.templateId}-${row.id}`} className="hover:bg-clinic-bg/30">
                      <td className="px-4 py-3 font-medium">{row.templateName}</td>
                      <td className="px-4 py-3">{row.studyName}</td>
                      <td className="px-4 py-3">{row.title}</td>
                      <td className="px-4 py-3">{row.order}</td>
                      <td className="px-4 py-3">{row.isRequired ? 'Sí' : 'No'}</td>
                      <td className="px-4 py-3">
                        {row.voiceEnabled ? 'Habilitado' : 'No'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!canEdit && user && (
        <p className="text-center text-xs text-clinic-text/50">
          Sesión como{' '}
          <strong>{user.role === 'doctor' ? 'médico' : 'asistente'}</strong> — solo
          consulta y vista previa.
        </p>
      )}

      <TemplatePreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={previewTemplate}
        study={previewStudy}
      />

      <TemplateEditorDrawer
        isOpen={editorOpen}
        mode={editorMode}
        template={editingTemplate}
        initialStudyId={newTemplateStudyId}
        studies={studies}
        templates={templates}
        specialties={specialties}
        canEdit={canEdit}
        onClose={() => {
          setEditorOpen(false)
          setEditingTemplate(null)
          setNewTemplateStudyId(null)
        }}
        onSave={handleSaveTemplate}
        onPreview={(tpl) => openPreview(tpl)}
      />

      <StudyEditorDrawer
        isOpen={studyEditorOpen}
        study={editingStudy}
        specialties={specialties}
        canEdit={canEdit}
        saving={saving}
        onClose={() => {
          setStudyEditorOpen(false)
          setEditingStudy(null)
        }}
        onSave={handleSaveStudy}
      />
        </>
      )}
    </div>
  )
}

function HeaderBtn({
  children,
  onClick,
  variant = 'outline',
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'outline' | 'primary'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition',
        variant === 'primary'
          ? 'bg-clinic-blue text-clinic-white hover:bg-clinic-deep-blue'
          : 'border border-clinic-sky bg-clinic-white text-clinic-text hover:bg-clinic-bg',
      )}
    >
      {children}
    </button>
  )
}

function FiltersBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
      {children}
    </div>
  )
}

function FilterInput({
  icon,
  value,
  onChange,
  placeholder,
}: {
  icon: ReactNode
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        {icon}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-clinic-sky/80 py-2.5 pr-3 pl-10 text-sm"
      />
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white px-6 py-12 text-center text-sm text-clinic-text/60">
      {text}
    </div>
  )
}
