import { AlertTriangle, Mic } from 'lucide-react'
import type { VoiceDictationSettings } from '@/types/settings'
import SettingsSwitch from '@/components/settings/SettingsSwitch'
import { inputClass, labelClass, sectionCardClass } from '@/utils/settings'

interface VoiceSettingsFormProps {
  value: VoiceDictationSettings
  onChange: (value: VoiceDictationSettings) => void
  readOnly?: boolean
}

const LANGUAGE_OPTIONS = [
  { value: 'es-PE', label: 'Español (Perú)' },
  { value: 'es', label: 'Español general' },
]

const FLOW_STEPS = [
  'El médico selecciona una sección del informe',
  'Presiona el botón Dictar',
  'El sistema transcribe el audio',
  'El médico revisa y edita el texto',
  'Guarda los hallazgos en la sección',
]

export default function VoiceSettingsForm({
  value,
  onChange,
  readOnly,
}: VoiceSettingsFormProps) {
  const set = <K extends keyof VoiceDictationSettings>(key: K, val: VoiceDictationSettings[K]) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${sectionCardClass} space-y-3`}>
        <h3 className="flex items-center gap-2 font-semibold text-clinic-deep-blue">
          <Mic className="h-5 w-5 text-clinic-teal" /> Dictado por voz
        </h3>
        <SettingsSwitch label="Activar dictado por voz" checked={value.enabled} disabled={readOnly} onChange={(v) => set('enabled', v)} />
        <SettingsSwitch label="Normalizar texto automáticamente" checked={value.autoNormalizeText} disabled={readOnly} onChange={(v) => set('autoNormalizeText', v)} />
        <SettingsSwitch label="Agregar dictado al final de la sección" checked={value.appendDictationToSection} disabled={readOnly} onChange={(v) => set('appendDictationToSection', v)} />
        <SettingsSwitch label="Mostrar animación mientras escucha" checked={value.showListeningAnimation} disabled={readOnly} onChange={(v) => set('showListeningAnimation', v)} />
        <SettingsSwitch label="Permitir edición manual" checked={value.allowManualEditing} disabled={readOnly} onChange={(v) => set('allowManualEditing', v)} />
        <label className={labelClass}>
          Idioma principal
          <select
            disabled={readOnly}
            value={value.language}
            onChange={(e) => set('language', e.target.value)}
            className={inputClass}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Tiempo máximo de grabación (minutos)
          <input
            type="number"
            min={1}
            max={30}
            disabled={readOnly}
            value={value.maxRecordingMinutes}
            onChange={(e) => set('maxRecordingMinutes', Number(e.target.value))}
            className={inputClass}
          />
        </label>
      </div>

      <div className="space-y-4">
        <div className={`${sectionCardClass} border-clinic-teal/30 bg-clinic-teal/5`}>
          <p className="text-sm text-clinic-text">
            El dictado por voz transcribe únicamente lo que el médico dicta. No genera hallazgos por sí solo.
          </p>
        </div>
        <div className={`${sectionCardClass}`}>
          <p className="mb-3 text-sm font-semibold text-clinic-deep-blue">Flujo de dictado</p>
          <ol className="space-y-2">
            {FLOW_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-clinic-text/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clinic-blue text-xs font-bold text-clinic-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>El dictado debe ser revisado por el médico antes de concluir el informe.</p>
        </div>
      </div>
    </div>
  )
}
