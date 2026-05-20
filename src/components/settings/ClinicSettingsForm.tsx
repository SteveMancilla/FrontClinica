import { Building2, RotateCcw } from 'lucide-react'
import type { ClinicSettings } from '@/types/settings'
import { inputClass, labelClass, sectionCardClass } from '@/utils/settings'

interface ClinicSettingsFormProps {
  value: ClinicSettings
  onChange: (value: ClinicSettings) => void
  readOnly?: boolean
  onRestore?: () => void
}

export default function ClinicSettingsForm({
  value,
  onChange,
  readOnly,
  onRestore,
}: ClinicSettingsFormProps) {
  const set = <K extends keyof ClinicSettings>(key: K, val: ClinicSettings[K]) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className={`${sectionCardClass} grid gap-4 sm:grid-cols-2`}>
          <label className={labelClass}>
            Nombre de la clínica *
            <input
              required
              disabled={readOnly}
              value={value.clinicName}
              onChange={(e) => set('clinicName', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Lema
            <input
              disabled={readOnly}
              value={value.slogan}
              onChange={(e) => set('slogan', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            RUC
            <input
              disabled={readOnly}
              value={value.ruc ?? ''}
              onChange={(e) => set('ruc', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Ciudad
            <input
              disabled={readOnly}
              value={value.city}
              onChange={(e) => set('city', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Dirección
            <input
              disabled={readOnly}
              value={value.address}
              onChange={(e) => set('address', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Teléfono
            <input
              disabled={readOnly}
              value={value.phone}
              onChange={(e) => set('phone', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Teléfono de emergencia
            <input
              disabled={readOnly}
              value={value.emergencyPhone}
              onChange={(e) => set('emergencyPhone', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Correo
            <input
              type="email"
              disabled={readOnly}
              value={value.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Sitio web
            <input
              disabled={readOnly}
              value={value.website ?? ''}
              onChange={(e) => set('website', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Logo de la clínica
            <div className="mt-2 flex items-center gap-4 rounded-lg border border-dashed border-clinic-sky bg-clinic-bg/50 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-clinic-blue/10 text-clinic-blue">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="text-sm text-clinic-text/70">
                <p className="font-medium">Vista previa del logo</p>
                <p className="text-xs">Formatos JPG o PNG. El logo se usará en informes PDF.</p>
                {!readOnly && (
                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-clinic-blue hover:underline"
                  >
                    Seleccionar imagen
                  </button>
                )}
              </div>
            </div>
          </label>
        </div>
        {!readOnly && onRestore && (
          <button
            type="button"
            onClick={onRestore}
            className="inline-flex items-center gap-2 text-sm font-medium text-clinic-blue hover:underline"
          >
            <RotateCcw className="h-4 w-4" /> Restaurar datos de clínica
          </button>
        )}
      </div>

      <aside className={`${sectionCardClass} h-fit border-clinic-blue/20 bg-gradient-to-br from-clinic-white to-clinic-bg`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-clinic-teal">
          Vista previa institucional
        </p>
        <div className="mt-4 space-y-2 border-b border-clinic-sky/50 pb-4">
          <h3 className="text-xl font-bold text-clinic-deep-blue">{value.clinicName}</h3>
          <p className="text-sm italic text-clinic-text/70">{value.slogan}</p>
        </div>
        <div className="mt-4 space-y-1 text-sm text-clinic-text/80">
          <p>{value.address}</p>
          <p>{value.city}</p>
          <p className="mt-2">Tel: {value.phone}</p>
          <p>Emergencia: {value.emergencyPhone}</p>
          <p>{value.email}</p>
          {value.website && <p>{value.website}</p>}
        </div>
      </aside>
    </div>
  )
}
