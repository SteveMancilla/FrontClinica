import type { ClinicSettings, ReportHeaderSettings } from '@/types/settings'
import SettingsSwitch from '@/components/settings/SettingsSwitch'
import { inputClass, labelClass, sectionCardClass } from '@/utils/settings'

interface ReportSettingsFormProps {
  value: ReportHeaderSettings
  clinic: ClinicSettings
  onChange: (value: ReportHeaderSettings) => void
  readOnly?: boolean
}

export default function ReportSettingsForm({
  value,
  clinic,
  onChange,
  readOnly,
}: ReportSettingsFormProps) {
  const set = <K extends keyof ReportHeaderSettings>(key: K, val: ReportHeaderSettings[K]) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-4">
        <div className={`${sectionCardClass} space-y-3`}>
          <h3 className="font-semibold text-clinic-deep-blue">Encabezado y pie</h3>
          <SettingsSwitch label="Mostrar logo" checked={value.showLogo} disabled={readOnly} onChange={(v) => set('showLogo', v)} />
          <SettingsSwitch label="Mostrar lema" checked={value.showSlogan} disabled={readOnly} onChange={(v) => set('showSlogan', v)} />
          <SettingsSwitch label="Mostrar dirección" checked={value.showAddress} disabled={readOnly} onChange={(v) => set('showAddress', v)} />
          <SettingsSwitch label="Mostrar teléfono" checked={value.showPhone} disabled={readOnly} onChange={(v) => set('showPhone', v)} />
          <SettingsSwitch label="Mostrar CMP del médico" checked={value.showDoctorCmp} disabled={readOnly} onChange={(v) => set('showDoctorCmp', v)} />
          <SettingsSwitch label="Mostrar RNE del médico" checked={value.showDoctorRne} disabled={readOnly} onChange={(v) => set('showDoctorRne', v)} />
          <SettingsSwitch label="Mostrar firma médica" checked={value.showMedicalSignature} disabled={readOnly} onChange={(v) => set('showMedicalSignature', v)} />
          <SettingsSwitch label="Mostrar pie de validación médica" checked={value.showValidationFooter} disabled={readOnly} onChange={(v) => set('showValidationFooter', v)} />
        </div>
        <div className={`${sectionCardClass} space-y-4`}>
          <label className={labelClass}>
            Título por defecto del informe
            <input disabled={readOnly} value={value.headerTitle} onChange={(e) => set('headerTitle', e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Texto de pie de página
            <textarea disabled={readOnly} rows={2} value={value.footerText} onChange={(e) => set('footerText', e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Nota legal o advertencia médica
            <textarea disabled={readOnly} rows={3} value={value.legalNote ?? ''} onChange={(e) => set('legalNote', e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div className={`${sectionCardClass} space-y-3`}>
        <p className="text-xs font-semibold uppercase text-clinic-teal">Vista previa del informe</p>
        <p className="text-xs text-clinic-text/60">
          Los datos superiores del informe se llenan automáticamente desde la atención seleccionada.
        </p>
        <div className="rounded-lg border border-clinic-sky/60 bg-clinic-bg/30 p-4 text-xs shadow-inner">
          {value.showLogo && (
            <div className="mb-2 flex items-center gap-2 border-b border-clinic-sky/40 pb-2">
              <div className="h-8 w-8 rounded bg-clinic-blue/20" />
              <div>
                <p className="font-bold text-clinic-deep-blue">{clinic.clinicName}</p>
                {value.showSlogan && <p className="text-clinic-text/60">{clinic.slogan}</p>}
              </div>
            </div>
          )}
          {value.showAddress && <p>{clinic.address}</p>}
          {value.showPhone && <p>Tel: {clinic.phone}</p>}
          <p className="mt-3 font-semibold text-clinic-deep-blue">{value.headerTitle}</p>
          <div className="mt-3 space-y-2 rounded border border-dashed border-clinic-sky/50 bg-clinic-white p-3">
            <p className="font-medium text-clinic-text">Hallazgos</p>
            <p className="text-clinic-text/70">Hígado con ecogenicidad aumentada. Vesícula con imagen litiásica.</p>
          </div>
          <div className="mt-3 rounded border border-clinic-teal/30 bg-clinic-teal/5 p-3">
            <p className="font-medium text-clinic-teal">Impresión diagnóstica</p>
            <ol className="mt-1 list-decimal pl-4 text-clinic-text/80">
              <li>Signos ecográficos de esteatosis hepática.</li>
              <li>Colecistopatía litiásica.</li>
            </ol>
          </div>
          {(value.showDoctorCmp || value.showDoctorRne) && (
            <p className="mt-3 text-clinic-text/70">
              {value.showDoctorCmp && 'CMP 12345 · '}
              {value.showDoctorRne && 'RNE 67890'}
            </p>
          )}
          {value.showMedicalSignature && (
            <p className="mt-2 border-t border-clinic-sky/40 pt-2 italic">Firma médica — Dra. Elena Mendoza</p>
          )}
          {value.showValidationFooter && (
            <p className="mt-2 text-[10px] text-clinic-text/50">{value.footerText}</p>
          )}
        </div>
      </div>
    </div>
  )
}
