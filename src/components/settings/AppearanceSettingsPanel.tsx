import clsx from 'clsx'
import type { AppearanceSettings, FontSizeOption } from '@/types/settings'
import SettingsSwitch from '@/components/settings/SettingsSwitch'
import StatusBadge from '@/components/ui/StatusBadge'
import { inputClass, labelClass, sectionCardClass } from '@/utils/settings'

interface AppearanceSettingsPanelProps {
  value: AppearanceSettings
  onChange: (value: AppearanceSettings) => void
  readOnly?: boolean
}

const FONT_OPTIONS: { value: FontSizeOption; label: string }[] = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
]

export default function AppearanceSettingsPanel({
  value,
  onChange,
  readOnly,
}: AppearanceSettingsPanelProps) {
  const set = <K extends keyof AppearanceSettings>(key: K, val: AppearanceSettings[K]) => {
    onChange({ ...value, [key]: val })
  }

  const fontScale =
    value.fontSize === 'small' ? 'text-sm' : value.fontSize === 'large' ? 'text-lg' : 'text-base'

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${sectionCardClass} space-y-4`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Color principal
            <div className="mt-1 flex items-center gap-2">
              <input type="color" disabled={readOnly} value={value.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} className="h-10 w-14 rounded border" />
              <input disabled={readOnly} value={value.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} className={inputClass} />
            </div>
          </label>
          <label className={labelClass}>
            Color secundario
            <div className="mt-1 flex items-center gap-2">
              <input type="color" disabled={readOnly} value={value.secondaryColor} onChange={(e) => set('secondaryColor', e.target.value)} className="h-10 w-14 rounded border" />
              <input disabled={readOnly} value={value.secondaryColor} onChange={(e) => set('secondaryColor', e.target.value)} className={inputClass} />
            </div>
          </label>
        </div>
        <label className={labelClass}>
          Tamaño de fuente
          <select
            disabled={readOnly}
            value={value.fontSize}
            onChange={(e) => set('fontSize', e.target.value as FontSizeOption)}
            className={inputClass}
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <SettingsSwitch label="Modo compacto" checked={value.compactMode} disabled={readOnly} onChange={(v) => set('compactMode', v)} />
        <SettingsSwitch label="Modo oscuro (visual, futuro)" checked={value.darkModeEnabled} disabled={readOnly} onChange={(v) => set('darkModeEnabled', v)} />
        <SettingsSwitch label="Mostrar sombras en tarjetas" checked={value.showCardShadows} disabled={readOnly} onChange={(v) => set('showCardShadows', v)} />
        <SettingsSwitch label="Sidebar compacto" checked={value.compactSidebar} disabled={readOnly} onChange={(v) => set('compactSidebar', v)} />
      </div>

      <div
        className={clsx(
          sectionCardClass,
          value.showCardShadows ? 'shadow-md' : 'shadow-none',
          fontScale,
        )}
      >
        <p className="text-xs font-semibold uppercase text-clinic-teal">Vista previa</p>
        <div className="mt-4 flex gap-3">
          <div
            className="w-12 shrink-0 rounded-lg p-2"
            style={{ backgroundColor: value.primaryColor }}
          >
            <div className="mb-2 h-2 rounded bg-white/40" />
            <div className="h-2 rounded bg-white/30" />
            <div className="mt-2 h-2 rounded bg-white/20" />
          </div>
          <div className="flex-1 space-y-3">
            <div
              className={clsx(
                'rounded-lg border p-4',
                value.compactMode ? 'p-3' : 'p-5',
              )}
              style={{ borderColor: `${value.secondaryColor}40` }}
            >
              <p className="font-semibold" style={{ color: value.primaryColor }}>
                Tarjeta de ejemplo
              </p>
              <p className="mt-1 text-clinic-text/70">Panel administrativo Clínica</p>
              <button
                type="button"
                className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: value.primaryColor }}
              >
                Botón principal
              </button>
              <div className="mt-3">
                <StatusBadge label="Activo" variant="success" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
