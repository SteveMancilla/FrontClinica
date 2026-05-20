import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  Loader2,
  Save,
} from 'lucide-react'
import ConcludeReportModal from '@/components/medical/ConcludeReportModal'
import DiagnosticImpressionPanel, {
  type DiagnosticImpressionSourceChoice,
} from '@/components/medical/DiagnosticImpressionPanel'
import ReportHelpPanel from '@/components/medical/ReportHelpPanel'
import ReportPatientInfoCard from '@/components/medical/ReportPatientInfoCard'
import ReportPreview from '@/components/medical/ReportPreview'
import ReportWorkflowSteps from '@/components/medical/ReportWorkflowSteps'
import VoiceDictationSection from '@/components/medical/VoiceDictationSection'
import StatusBadge from '@/components/ui/StatusBadge'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import {
  concludeMedicalReport,
  downloadMedicalReportPdf,
  generateDiagnosticImpression,
  updateMedicalReport,
} from '@/services/medicalReportService'
import type { MedicalReportDraft, ReportEditorContext } from '@/types/medical'
import { appendDictationText } from '@/utils/speechNormalizer'
import { analyzeReportSections } from '@/utils/reportAnalysis'
import { loadReportEditor } from '@/utils/reportEditorLoader'
import {
  computeDraftStatus,
  draftStatusLabels,
  recomputeWorkflowStatus,
} from '@/utils/reportDraft'
import { createDraftFromApiReport } from '@/utils/reportEditorLoader'
import { getReportStatusVariant } from '@/utils/reportStatus'

type LoadState = 'idle' | 'loading' | 'error' | 'ready'
type DictationTarget = 'section' | 'impression'

export default function NewReportPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reportId = searchParams.get('reportId')
  const appointmentId = searchParams.get('appointmentId')

  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [context, setContext] = useState<ReportEditorContext | null>(null)
  const [draft, setDraft] = useState<MedicalReportDraft | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [isGeneratingImpression, setIsGeneratingImpression] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [doctorImpression, setDoctorImpression] = useState('')
  const [impressionSource, setImpressionSource] =
    useState<DiagnosticImpressionSourceChoice>(null)
  const [dictationTarget, setDictationTarget] = useState<DictationTarget | null>(
    null,
  )
  const dictationTargetRef = useRef<DictationTarget>('section')
  const activeSectionIdRef = useRef<string | null>(null)
  const impressionSourceRef = useRef<DiagnosticImpressionSourceChoice>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [concludeOpen, setConcludeOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  useEffect(() => {
    if (!reportId && !appointmentId) {
      navigate('/reports', { replace: true })
      return
    }

    let cancelled = false
    setLoadState('loading')
    setLoadError(null)
    setContext(null)
    setDraft(null)

    loadReportEditor(reportId, appointmentId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setLoadError('No se encontró el informe o la atención indicada.')
          setLoadState('error')
          return
        }
        setContext(result.context)
        setDraft(result.draft)
        const firstSectionId = result.draft.sections[0]?.id ?? null
        setActiveSectionId(firstSectionId)
        activeSectionIdRef.current = firstSectionId
        const savedImpression = result.draft.diagnosticImpression
        setDoctorImpression(savedImpression)
        setAiSuggestion('')
        setImpressionSource(savedImpression.trim() ? 'doctor' : null)
        setLoadState('ready')
      })
      .catch((error) => {
        if (cancelled) return
        setLoadError(
          error instanceof Error ? error.message : 'No se pudo cargar el informe.',
        )
        setLoadState('error')
      })

    return () => {
      cancelled = true
    }
  }, [reportId, appointmentId, navigate])

  useEffect(() => {
    activeSectionIdRef.current = activeSectionId
  }, [activeSectionId])

  useEffect(() => {
    impressionSourceRef.current = impressionSource
  }, [impressionSource])

  const syncReportImpression = useCallback(
    (text: string, source: DiagnosticImpressionSourceChoice) => {
      setImpressionSource(source)
      setDraft((prev) => {
        if (!prev) return prev
        const next = {
          ...prev,
          diagnosticImpression: text,
          updatedAt: new Date().toISOString(),
        }
        const wasFinalized =
          prev.status === 'concluded' || prev.status === 'pdf_generated'
        next.status = wasFinalized
          ? recomputeWorkflowStatus(next)
          : computeDraftStatus(next)
        return next
      })
      setSuccessMessage(null)
    },
    [],
  )

  const handleDictationTranscript = useCallback(
    (text: string) => {
      if (dictationTargetRef.current === 'impression') {
        setDoctorImpression((prev) => {
          const next = appendDictationText(prev, text)
          if (impressionSourceRef.current === 'doctor') {
            syncReportImpression(next, 'doctor')
          }
          return next
        })
        return
      }

      const sectionId = activeSectionIdRef.current
      if (!sectionId) return

      setDraft((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === sectionId
              ? { ...s, content: appendDictationText(s.content, text) }
              : s,
          ),
          updatedAt: new Date().toISOString(),
        }
      })
    },
    [syncReportImpression],
  )

  const { isListening, isSupported, start, stop } =
    useSpeechRecognition(handleDictationTranscript)

  const analysis = useMemo(
    () => analyzeReportSections(draft?.sections ?? []),
    [draft?.sections],
  )

  const activeSection = draft?.sections.find((s) => s.id === activeSectionId)

  const workflowStep = useMemo(() => {
    if (!draft) return 1
    if (draft.status === 'concluded' || draft.status === 'pdf_generated') return 5
    const hasContent = draft.sections.some(
      (s) => s.content.trim() !== s.baseText.trim(),
    )
    const hasImpression = draft.diagnosticImpression.trim().length > 10
    if (!hasContent && draft.status === 'missing_report') return 2
    if (!hasImpression) return 3
    if (draft.status === 'in_review') return 4
    return 4
  }, [draft])

  const updateDraft = (updater: (d: MedicalReportDraft) => MedicalReportDraft) => {
    setDraft((prev) => {
      if (!prev) return prev
      const next = updater(prev)
      const wasFinalized =
        prev.status === 'concluded' || prev.status === 'pdf_generated'
      next.status = wasFinalized
        ? recomputeWorkflowStatus(next)
        : computeDraftStatus(next)
      return { ...next, updatedAt: new Date().toISOString() }
    })
    setSuccessMessage(null)
  }

  const updateSection = (sectionId: string, content: string) => {
    updateDraft((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === sectionId ? { ...s, content } : s,
      ),
    }))
  }

  const persistDraft = async (draftToSave: MedicalReportDraft) => {
    const result = await updateMedicalReport(draftToSave.id, {
      diagnosticImpression: draftToSave.diagnosticImpression,
      status: draftToSave.status,
      sections: draftToSave.sections.map((s) => ({
        id: s.id,
        content: s.content,
      })),
    })
    return result
  }

  const handleGenerateImpression = async () => {
    if (!draft || !context) return

    const hasFindings = draft.sections.some((s) => s.content.trim().length > 0)
    if (!hasFindings) {
      setLoadError(
        'Dicta o escribe hallazgos en al menos una sección antes de generar la impresión diagnóstica.',
      )
      return
    }

    setIsGeneratingImpression(true)
    setLoadError(null)

    try {
      await persistDraft(draft)

      const result = await generateDiagnosticImpression(
        draft.id,
        draft.sections.map((s) => ({ id: s.id, content: s.content })),
      )

      setAiSuggestion(result.diagnosticImpression)
      setSuccessMessage(
        'Sugerencia generada. Revísela y pulse «Usar en el informe» si desea incluirla.',
      )
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudo generar la sugerencia. Intente de nuevo.',
      )
    } finally {
      setIsGeneratingImpression(false)
    }
  }

  const handleDownloadPdf = async (regenerate = false) => {
    if (!draft) return
    setIsDownloadingPdf(true)
    setLoadError(null)
    try {
      const saved = await persistDraft(draft)
      const needsRegenerate =
        regenerate || saved.status !== 'pdf_generated' || !saved.pdfPath

      await downloadMedicalReportPdf(draft.id, { regenerate: needsRegenerate })
      setDraft(createDraftFromApiReport({ ...saved, status: 'pdf_generated' }))
      setSuccessMessage('PDF descargado correctamente.')
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudo generar o descargar el PDF.',
      )
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const handleConclude = async () => {
    if (!draft) return
    setIsSaving(true)
    try {
      await persistDraft({ ...draft, status: 'in_review' })
      await concludeMedicalReport(draft.id)
      updateDraft((d) => ({ ...d, status: 'concluded' }))
      setConcludeOpen(false)
      setSuccessMessage('Informe concluido correctamente.')
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'No se pudo concluir el informe.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!draft) return
    setIsSaving(true)
    try {
      const saved = await persistDraft(draft)
      setDraft(createDraftFromApiReport(saved))
      const pdfInvalidated =
        saved.status !== 'pdf_generated' &&
        (draft.status === 'pdf_generated' || draft.status === 'concluded')
      setSuccessMessage(
        pdfInvalidated
          ? 'Cambios guardados. Vuelva a descargar el PDF para actualizar el documento.'
          : 'Borrador guardado correctamente.',
      )
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'No se pudo guardar el borrador.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-clinic-text/70">
        <Loader2 className="h-8 w-8 animate-spin text-clinic-blue" />
        <p className="text-sm">Cargando plantilla e informe...</p>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm text-red-700">
          {loadError ?? 'No se pudo abrir el informe.'}
        </p>
        <Link
          to="/reports"
          className="inline-flex rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
        >
          Volver a la bandeja de informes
        </Link>
      </div>
    )
  }

  if (!context || !draft) {
    return null
  }

  const isFinalized =
    draft.status === 'concluded' || draft.status === 'pdf_generated'
  const canDownloadPdf =
    draft.diagnosticImpression.trim().length > 0 &&
    draft.sections.some((s) => s.content.trim().length > 0)
  const canConclude =
    draft.diagnosticImpression.trim().length > 10 &&
    draft.sections.some((s) => s.content.trim().length > 0)

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-clinic-deep-blue">
              Dictado de informe
            </h1>
            <p className="mt-1 text-sm text-clinic-text/70">
              {context.study.name} · {context.patient.fullName}
            </p>
            <div className="mt-3">
              <StatusBadge
                label={draftStatusLabels[draft.status]}
                variant={getReportStatusVariant(draft.status)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleSaveDraft()}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky px-3 py-2 text-sm font-medium text-clinic-text hover:bg-clinic-bg disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando…' : 'Guardar borrador'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky px-3 py-2 text-sm font-medium text-clinic-text hover:bg-clinic-bg"
            >
              <Eye className="h-4 w-4" />
              Vista previa
            </button>
            {canDownloadPdf && (
              <button
                type="button"
                onClick={() => void handleDownloadPdf(false)}
                disabled={isDownloadingPdf || isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-teal bg-clinic-teal/10 px-3 py-2 text-sm font-semibold text-clinic-teal hover:bg-clinic-teal/20 disabled:opacity-60"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Descargar PDF
              </button>
            )}
            <button
              type="button"
              onClick={() => setConcludeOpen(true)}
              disabled={!canConclude || isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-clinic-blue px-3 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
            >
              <FileCheck className="h-4 w-4" />
              {isFinalized ? 'Revalidar diagnóstico' : 'Diagnóstico concluido'}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <ReportWorkflowSteps activeStep={workflowStep} />
        </div>
      </header>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMessage}
        </div>
      )}

      {isFinalized && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Este informe ya fue concluido{draft.status === 'pdf_generated' ? ' y tiene PDF generado' : ''}.
          Puede editar hallazgos e impresión; al guardar, descargue el PDF nuevamente para
          actualizar el documento impreso.
        </p>
      )}

      <ReportPatientInfoCard context={context} />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-clinic-deep-blue">
              {context.template.formatType === 'structured'
                ? 'Hallazgos por sección'
                : 'Hallazgos del estudio'}
            </h2>
            <div className="space-y-4">
              {draft.sections.map((section) => (
                <VoiceDictationSection
                  key={section.id}
                  section={section}
                  isActive={activeSectionId === section.id}
                  isListening={
                    isListening &&
                    dictationTarget === 'section' &&
                    activeSectionId === section.id
                  }
                  speechSupported={isSupported}
                  onChange={(content) => updateSection(section.id, content)}
                  onActivate={() => setActiveSectionId(section.id)}
                  onStartDictation={() => {
                    setActiveSectionId(section.id)
                    activeSectionIdRef.current = section.id
                    dictationTargetRef.current = 'section'
                    setDictationTarget('section')
                    start()
                  }}
                  onStopDictation={() => {
                    stop()
                    setDictationTarget(null)
                  }}
                  onRestoreBase={() =>
                    updateSection(section.id, section.baseText)
                  }
                  onClear={() => updateSection(section.id, '')}
                />
              ))}
            </div>
          </section>

          <DiagnosticImpressionPanel
            aiSuggestion={aiSuggestion}
            doctorImpression={doctorImpression}
            activeSource={impressionSource}
            isGenerating={isGeneratingImpression}
            isConcluded={isFinalized}
            isListeningDoctor={isListening && dictationTarget === 'impression'}
            speechSupported={isSupported}
            onAiSuggestionChange={(value) => {
              setAiSuggestion(value)
              if (impressionSource === 'ai') {
                syncReportImpression(value, 'ai')
              }
            }}
            onDoctorImpressionChange={(value) => {
              setDoctorImpression(value)
              if (impressionSource === 'doctor') {
                syncReportImpression(value, 'doctor')
              }
            }}
            onGenerate={() => void handleGenerateImpression()}
            onRegenerate={() => void handleGenerateImpression()}
            onClearAi={() => {
              setAiSuggestion('')
              if (impressionSource === 'ai') {
                syncReportImpression('', 'ai')
              }
            }}
            onClearDoctor={() => {
              setDoctorImpression('')
              if (impressionSource === 'doctor') {
                syncReportImpression('', 'doctor')
              }
            }}
            onUseAiInReport={() => syncReportImpression(aiSuggestion, 'ai')}
            onUseDoctorInReport={() =>
              syncReportImpression(doctorImpression, 'doctor')
            }
            onStartDoctorDictation={() => {
              dictationTargetRef.current = 'impression'
              setDictationTarget('impression')
              start()
            }}
            onStopDoctorDictation={() => {
              stop()
              setDictationTarget(null)
            }}
          />
        </div>

        <ReportHelpPanel
          activeSectionTitle={activeSection?.title ?? null}
          isListening={isListening}
          speechSupported={isSupported}
          analysis={analysis}
          diagnosticImpression={draft.diagnosticImpression}
          impressionSource={impressionSource}
          isGeneratingImpression={isGeneratingImpression}
        />
      </div>

      <ReportPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        context={context}
        sections={draft.sections}
        diagnosticImpression={draft.diagnosticImpression}
        reportId={draft.id}
        canDownloadPdf={canDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        onDownloadPdf={() => void handleDownloadPdf(false)}
      />

      <ConcludeReportModal
        isOpen={concludeOpen}
        onClose={() => setConcludeOpen(false)}
        onConfirm={() => void handleConclude()}
      />
    </div>
  )
}
