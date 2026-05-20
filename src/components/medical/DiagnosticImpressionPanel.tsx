import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Check, Loader2, Mic, MicOff, Sparkles, Trash2 } from 'lucide-react'

export type DiagnosticImpressionSourceChoice = 'ai' | 'doctor' | null

interface DiagnosticImpressionPanelProps {
  aiSuggestion: string
  doctorImpression: string
  activeSource: DiagnosticImpressionSourceChoice
  isGenerating: boolean
  isConcluded: boolean
  isListeningDoctor: boolean
  speechSupported: boolean
  onAiSuggestionChange: (value: string) => void
  onDoctorImpressionChange: (value: string) => void
  onGenerate: () => void
  onRegenerate: () => void
  onClearAi: () => void
  onClearDoctor: () => void
  onUseAiInReport: () => void
  onUseDoctorInReport: () => void
  onStartDoctorDictation: () => void
  onStopDoctorDictation: () => void
}

export default function DiagnosticImpressionPanel(props: DiagnosticImpressionPanelProps) {
  const {
    aiSuggestion,
    doctorImpression,
    activeSource,
    isGenerating,
    isConcluded,
    isListeningDoctor,
    speechSupported,
    onAiSuggestionChange,
    onDoctorImpressionChange,
    onGenerate,
    onRegenerate,
    onClearAi,
    onClearDoctor,
    onUseAiInReport,
    onUseDoctorInReport,
    onStartDoctorDictation,
    onStopDoctorDictation,
  } = props

  const aiActive = activeSource === 'ai'
  const doctorActive = activeSource === 'doctor'

  return (
    <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-clinic-deep-blue">Impresión diagnóstica</h2>
        <p className="mt-1 text-sm text-clinic-text/70">
          Use la sugerencia automática o redacte/dicte su propia impresión. Una de las dos
          pasará al informe final.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ImpressionBox
          title="Sugerencia automática"
          subtitle="Generada a partir de los hallazgos dictados"
          isActive={aiActive}
        >
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating || isConcluded}
              className="inline-flex items-center gap-1.5 rounded-lg bg-clinic-blue px-3 py-1.5 text-xs font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Generar sugerencia
            </button>
            {aiSuggestion.trim() && (
              <button
                type="button"
                onClick={onRegenerate}
                disabled={isGenerating || isConcluded}
                className="rounded-lg border border-clinic-sky px-3 py-1.5 text-xs font-medium text-clinic-text hover:bg-clinic-bg disabled:opacity-60"
              >
                Regenerar
              </button>
            )}
            <button
              type="button"
              onClick={onClearAi}
              disabled={isConcluded}
              className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar
            </button>
          </div>
          {isGenerating && (
            <p className="mb-3 flex items-center gap-2 text-sm text-clinic-blue">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando sugerencia…
            </p>
          )}
          <textarea
            value={aiSuggestion}
            onChange={(e) => onAiSuggestionChange(e.target.value)}
            rows={7}
            disabled={isConcluded}
            className="w-full resize-y rounded-lg border border-clinic-sky/80 bg-clinic-bg/30 px-3 py-2.5 text-sm leading-relaxed text-clinic-text outline-none focus:border-clinic-blue focus:ring-2 focus:ring-clinic-blue/15 disabled:opacity-70"
            placeholder="Pulse «Generar» para obtener una sugerencia a partir de los hallazgos…"
          />
          <UseInReportButton
            disabled={!aiSuggestion.trim() || isConcluded}
            isSelected={aiActive}
            onClick={onUseAiInReport}
          />
        </ImpressionBox>

        <ImpressionBox
          title="Impresión del médico"
          subtitle="Dictado por voz o redacción manual"
          isActive={doctorActive}
        >
          {!speechSupported && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              El dictado por voz no está disponible en este navegador. Puede escribir
              manualmente.
            </p>
          )}
          {isListeningDoctor && (
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-clinic-teal">
              <span className="h-2 w-2 animate-pulse rounded-full bg-clinic-teal" />
              Escuchando dictado…
            </p>
          )}
          <textarea
            value={doctorImpression}
            onChange={(e) => onDoctorImpressionChange(e.target.value)}
            rows={7}
            disabled={isConcluded}
            className="w-full resize-y rounded-lg border border-clinic-sky/80 bg-clinic-bg/30 px-3 py-2.5 text-sm leading-relaxed text-clinic-text outline-none focus:border-clinic-blue focus:ring-2 focus:ring-clinic-blue/15 disabled:opacity-70"
            placeholder="Dicta o escribe la impresión diagnóstica que desea incluir en el informe…"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {speechSupported && (
              <>
                <button
                  type="button"
                  onClick={onStartDoctorDictation}
                  disabled={isListeningDoctor || isConcluded}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-clinic-teal px-3 py-1.5 text-xs font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Dictar
                </button>
                <button
                  type="button"
                  onClick={onStopDoctorDictation}
                  disabled={!isListeningDoctor || isConcluded}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky px-3 py-1.5 text-xs font-medium text-clinic-text hover:bg-clinic-bg disabled:opacity-50"
                >
                  <MicOff className="h-3.5 w-3.5" />
                  Detener
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClearDoctor}
              disabled={isConcluded}
              className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar
            </button>
          </div>
          <UseInReportButton
            disabled={!doctorImpression.trim() || isConcluded}
            isSelected={doctorActive}
            onClick={onUseDoctorInReport}
          />
        </ImpressionBox>
      </div>

      <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-900/90">
        Elija una opción y pulse «Usar en el informe». Solo la impresión seleccionada se
        incluirá en el PDF y al concluir el estudio.
      </p>
    </section>
  )
}

function ImpressionBox({
  title,
  subtitle,
  isActive,
  children,
}: {
  title: string
  subtitle: string
  isActive: boolean
  children: ReactNode
}) {
  return (
    <div
      className={clsx(
        'flex flex-col rounded-xl border p-4 transition',
        isActive
          ? 'border-clinic-teal bg-clinic-sky/15 ring-2 ring-clinic-teal/25'
          : 'border-clinic-sky/60 bg-clinic-bg/20',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-clinic-deep-blue">{title}</h3>
          <p className="text-xs text-clinic-text/60">{subtitle}</p>
        </div>
        {isActive && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-clinic-teal px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-clinic-white">
            <Check className="h-3 w-3" />
            En el informe
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function UseInReportButton({
  disabled,
  isSelected,
  onClick,
}: {
  disabled: boolean
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition disabled:opacity-50',
        isSelected
          ? 'border border-clinic-teal bg-clinic-teal/20 text-clinic-deep-blue'
          : 'border border-clinic-blue bg-clinic-blue text-clinic-white hover:bg-clinic-deep-blue',
      )}
    >
      <Check className="h-3.5 w-3.5" />
      {isSelected ? 'Usada en el informe' : 'Usar en el informe'}
    </button>
  )
}
