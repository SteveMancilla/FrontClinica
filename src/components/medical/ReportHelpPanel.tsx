import { AlertTriangle, ListChecks, Ruler } from 'lucide-react'
import type { DiagnosticImpressionSourceChoice } from '@/components/medical/DiagnosticImpressionPanel'
import type { ReportAnalysisResult } from '@/utils/reportAnalysis'

interface ReportHelpPanelProps {
  activeSectionTitle: string | null
  isListening: boolean
  speechSupported: boolean
  analysis: ReportAnalysisResult
  diagnosticImpression: string
  impressionSource: DiagnosticImpressionSourceChoice
  isGeneratingImpression: boolean
}

export default function ReportHelpPanel({
  activeSectionTitle,
  isListening,
  speechSupported,
  analysis,
  diagnosticImpression,
  impressionSource,
  isGeneratingImpression,
}: ReportHelpPanelProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-clinic-deep-blue">
          Estado del dictado
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-clinic-text/80">
          <li>
            <span className="font-medium">Navegador:</span>{' '}
            {speechSupported ? 'Dictado disponible' : 'Solo edición manual'}
          </li>
          <li>
            <span className="font-medium">Escucha:</span>{' '}
            {isListening ? 'Activa' : 'Inactiva'}
          </li>
          <li>
            <span className="font-medium">Sección activa:</span>{' '}
            {activeSectionTitle ?? 'Ninguna'}
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-clinic-deep-blue">
          <Ruler className="h-4 w-4 text-clinic-teal" />
          Valores detectados
        </h3>
        {analysis.detectedValues.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-clinic-text">
            {analysis.detectedValues.map((v) => (
              <li key={v} className="rounded bg-clinic-bg/60 px-2 py-1">
                {v}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-clinic-text/50">
            Sin medidas detectadas aún.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-clinic-deep-blue">
          <ListChecks className="h-4 w-4 text-clinic-teal" />
          Hallazgos relevantes
        </h3>
        {analysis.detectedFindings.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-clinic-text">
            {analysis.detectedFindings.map((f) => (
              <li key={f} className="rounded bg-clinic-bg/60 px-2 py-1">
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-clinic-text/50">
            No se detectaron palabras clave aún.
          </p>
        )}
        <p className="mt-2 text-[10px] text-clinic-text/40">
          Solo listado automático. No constituye diagnóstico.
        </p>
      </section>

      <section className="rounded-xl border border-clinic-teal/30 bg-clinic-sky/20 p-4">
        <h3 className="text-sm font-semibold text-clinic-deep-blue">
          Impresión en el informe
        </h3>
        <p className="mt-2 text-xs text-clinic-text/70">
          {isGeneratingImpression
            ? 'Generando sugerencia automática…'
            : diagnosticImpression.trim()
              ? impressionSource === 'ai'
                ? 'Usando sugerencia automática (revisada).'
                : impressionSource === 'doctor'
                  ? 'Usando impresión del médico.'
                  : 'Texto cargado — confirme con «Usar en el informe».'
              : 'Elija sugerencia automática o impresión del médico.'}
        </p>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          Validación médica
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-amber-900/80">
          La impresión diagnóstica sugerida debe ser revisada y validada por el
          médico antes de emitir el informe. El dictado solo transcribe; no
          reemplaza el criterio clínico.
        </p>
      </section>
    </aside>
  )
}
