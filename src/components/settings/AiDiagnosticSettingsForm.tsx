import { useState } from 'react'
import { AlertTriangle, Brain, Sparkles } from 'lucide-react'
import type { AiDiagnosticSettings, AiProvider } from '@/types/settings'
import SettingsSwitch from '@/components/settings/SettingsSwitch'
import { inputClass, labelClass, sectionCardClass } from '@/utils/settings'

interface AiDiagnosticSettingsFormProps {
  value: AiDiagnosticSettings
  onChange: (value: AiDiagnosticSettings) => void
  readOnly?: boolean
}

const PROVIDER_OPTIONS: { value: AiProvider; label: string }[] = [
  { value: 'ollama', label: 'Ollama (recomendado)' },
  { value: 'backend', label: 'Servidor API' },
  { value: 'mock', label: 'Modo prueba (sin IA)' },
]

const RULES = [
  'No inventar hallazgos',
  'No reemplazar criterio médico',
  'No indicar tratamiento',
  'Responder en formato numerado',
  'Basarse solo en el informe dictado',
  'Si hay contradicción, pedir revisión médica',
]

const MOCK_INPUT = 'Hígado con ecogenicidad aumentada. Vesícula con imagen litiásica.'
const MOCK_OUTPUT = [
  'Signos ecográficos de esteatosis hepática.',
  'Colecistopatía litiásica.',
]

export default function AiDiagnosticSettingsForm({
  value,
  onChange,
  readOnly,
}: AiDiagnosticSettingsFormProps) {
  const [testVisible, setTestVisible] = useState(false)

  const set = <K extends keyof AiDiagnosticSettings>(key: K, val: AiDiagnosticSettings[K]) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="space-y-6">
      <div className={`${sectionCardClass} border-clinic-blue/20 bg-clinic-blue/5`}>
        <p className="flex items-start gap-2 text-sm text-clinic-text">
          <Brain className="mt-0.5 h-5 w-5 shrink-0 text-clinic-blue" />
          La IA no redacta hallazgos. Solo analiza los hallazgos dictados y propone una impresión diagnóstica editable.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${sectionCardClass} space-y-3`}>
          <SettingsSwitch label="Activar impresión diagnóstica sugerida" checked={value.enabled} disabled={readOnly} onChange={(v) => set('enabled', v)} />
          <label className={labelClass}>
            Proveedor
            <select
              disabled={readOnly}
              value={value.provider}
              onChange={(e) => set('provider', e.target.value as AiProvider)}
              className={inputClass}
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Modelo
            <input disabled={readOnly} value={value.modelName} onChange={(e) => set('modelName', e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Endpoint Ollama
            <input disabled={readOnly} value={value.endpointUrl} onChange={(e) => set('endpointUrl', e.target.value)} className={inputClass} />
          </label>
          <SettingsSwitch label="Generar solo con botón" checked={value.generateOnlyOnButton} disabled={readOnly} onChange={(v) => set('generateOnlyOnButton', v)} />
          <SettingsSwitch label="Permitir regenerar" checked={value.allowRegenerate} disabled={readOnly} onChange={(v) => set('allowRegenerate', v)} />
          <SettingsSwitch label="Requerir validación médica" checked={value.requireDoctorValidation} disabled={readOnly} onChange={(v) => set('requireDoctorValidation', v)} />
          <SettingsSwitch label="Mostrar advertencia clínica" checked={value.includeClinicalWarning} disabled={readOnly} onChange={(v) => set('includeClinicalWarning', v)} />
          <label className={labelClass}>
            Reglas del prompt (promptRules)
            <textarea
              disabled={readOnly}
              rows={8}
              value={value.promptRules}
              onChange={(e) => set('promptRules', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="space-y-4">
          <div className={`${sectionCardClass}`}>
            <p className="mb-3 font-semibold text-clinic-deep-blue">Reglas principales</p>
            <ul className="space-y-2">
              {RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-sm text-clinic-text/80">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-clinic-teal" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          {value.includeClinicalWarning && (
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>La impresión sugerida no sustituye el criterio del médico responsable.</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setTestVisible(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
          >
            <Sparkles className="h-4 w-4" /> Probar generación de prueba
          </button>
          {testVisible && (
            <div className={`${sectionCardClass} space-y-3 border-clinic-teal/30`}>
              <p className="text-xs font-semibold uppercase text-clinic-teal">Resultado de prueba</p>
              <div>
                <p className="text-xs font-medium text-clinic-text/60">Entrada (hallazgos)</p>
                <p className="mt-1 rounded bg-clinic-bg p-2 text-sm">{MOCK_INPUT}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-clinic-text/60">Salida (impresión)</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                  {MOCK_OUTPUT.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
