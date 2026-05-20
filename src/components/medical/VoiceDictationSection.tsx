import clsx from 'clsx'
import { Mic, MicOff, RotateCcw, Trash2 } from 'lucide-react'
import type { ReportSection } from '@/types/medical'

interface VoiceDictationSectionProps {
  section: ReportSection
  isActive: boolean
  isListening: boolean
  speechSupported: boolean
  onChange: (content: string) => void
  onActivate: () => void
  onStartDictation: () => void
  onStopDictation: () => void
  onRestoreBase: () => void
  onClear: () => void
}

export default function VoiceDictationSection({
  section,
  isActive,
  isListening,
  speechSupported,
  onChange,
  onActivate,
  onStartDictation,
  onStopDictation,
  onRestoreBase,
  onClear,
}: VoiceDictationSectionProps) {
  return (
    <article
      className={clsx(
        'rounded-xl border bg-clinic-white p-4 shadow-sm transition',
        isActive
          ? 'border-clinic-teal ring-2 ring-clinic-teal/20'
          : 'border-clinic-sky/50',
        isListening && 'border-clinic-teal',
      )}
      onFocus={onActivate}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-clinic-deep-blue">{section.title}</h3>
          {section.isRequired && (
            <span className="rounded-full bg-clinic-sky/60 px-2 py-0.5 text-xs font-medium text-clinic-deep-blue">
              Requerida
            </span>
          )}
        </div>
        {isListening && isActive && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-clinic-teal">
            <span className="h-2 w-2 animate-pulse rounded-full bg-clinic-teal" />
            Escuchando dictado...
          </span>
        )}
      </div>

      {!speechSupported && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          El dictado por voz no está disponible en este navegador. Puedes escribir
          manualmente.
        </p>
      )}

      <textarea
        value={section.content}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onActivate}
        rows={section.title.toLowerCase().includes('hallazgos') ? 8 : 4}
        className="w-full resize-y rounded-lg border border-clinic-sky/80 bg-clinic-bg/30 px-3 py-2.5 text-sm leading-relaxed text-clinic-text outline-none focus:border-clinic-blue focus:ring-2 focus:ring-clinic-blue/15"
        placeholder="Dicta o escribe los hallazgos de esta sección..."
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {speechSupported && (
          <>
            <button
              type="button"
              onClick={onStartDictation}
              disabled={isListening && isActive}
              className="inline-flex items-center gap-1.5 rounded-lg bg-clinic-teal px-3 py-1.5 text-xs font-semibold text-clinic-white transition hover:bg-clinic-deep-blue disabled:opacity-60"
            >
              <Mic className="h-3.5 w-3.5" />
              Dictar
            </button>
            <button
              type="button"
              onClick={onStopDictation}
              disabled={!isListening || !isActive}
              className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky px-3 py-1.5 text-xs font-medium text-clinic-text transition hover:bg-clinic-bg disabled:opacity-50"
            >
              <MicOff className="h-3.5 w-3.5" />
              Detener
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onRestoreBase}
          className="inline-flex items-center gap-1.5 rounded-lg border border-clinic-sky px-3 py-1.5 text-xs font-medium text-clinic-text hover:bg-clinic-bg"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar texto base
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Limpiar
        </button>
      </div>
    </article>
  )
}
