import clsx from 'clsx'
import type { SecuritySettings } from '@/types/settings'
import { mockActivityLog } from '@/data/mockSettings'
import SettingsSwitch from '@/components/settings/SettingsSwitch'
import { inputClass, labelClass, sectionCardClass } from '@/utils/settings'

interface SecuritySettingsPanelProps {
  value: SecuritySettings
  onChange: (value: SecuritySettings) => void
  readOnly?: boolean
}

export default function SecuritySettingsPanel({
  value,
  onChange,
  readOnly,
}: SecuritySettingsPanelProps) {
  const set = <K extends keyof SecuritySettings>(key: K, val: SecuritySettings[K]) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="space-y-6">
      <div className={`${sectionCardClass} grid gap-4 sm:grid-cols-2`}>
        <label className={labelClass}>
          Tiempo de sesión activa (minutos)
          <input
            type="number"
            min={5}
            disabled={readOnly}
            value={value.sessionTimeoutMinutes}
            onChange={(e) => set('sessionTimeoutMinutes', Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Máximo de intentos fallidos
          <input
            type="number"
            min={1}
            disabled={readOnly}
            value={value.maxLoginAttempts}
            onChange={(e) => set('maxLoginAttempts', Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <div className="space-y-3 sm:col-span-2">
          <SettingsSwitch label='Permitir "Recordarme"' checked={value.allowRememberMe} disabled={readOnly} onChange={(v) => set('allowRememberMe', v)} />
          <SettingsSwitch label="Cambio obligatorio de contraseña en primer ingreso" checked={value.requirePasswordChangeOnFirstLogin} disabled={readOnly} onChange={(v) => set('requirePasswordChangeOnFirstLogin', v)} />
          <SettingsSwitch label="Registro de actividad de usuario" checked={value.enableActivityLog} disabled={readOnly} onChange={(v) => set('enableActivityLog', v)} />
          <SettingsSwitch label="Autenticación en dos pasos (visual, futuro)" checked={value.enableTwoFactorVisualOnly} disabled={readOnly} onChange={(v) => set('enableTwoFactorVisualOnly', v)} />
        </div>
      </div>

      {value.enableActivityLog && (
        <div className={`${sectionCardClass}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-clinic-deep-blue">Actividad reciente</h3>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg border border-clinic-sky px-3 py-1.5 text-xs font-medium hover:bg-clinic-bg">
                Ver historial completo
              </button>
              <button type="button" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                Limpiar sesiones inactivas
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-clinic-text/50">
                  <th className="px-3 py-2">Usuario</th>
                  <th className="px-3 py-2">Acción</th>
                  <th className="px-3 py-2">Módulo</th>
                  <th className="px-3 py-2">Fecha y hora</th>
                  <th className="px-3 py-2">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {mockActivityLog.map((entry) => (
                  <tr key={entry.id} className="border-b border-clinic-sky/30 last:border-0">
                    <td className="px-3 py-2.5 font-medium">{entry.userName}</td>
                    <td className="px-3 py-2.5">{entry.action}</td>
                    <td className="px-3 py-2.5 text-clinic-text/70">{entry.module}</td>
                    <td className="px-3 py-2.5 text-clinic-text/60">
                      {new Date(entry.timestamp).toLocaleString('es-PE')}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          entry.result === 'success' && 'bg-emerald-50 text-emerald-700',
                          entry.result === 'warning' && 'bg-amber-50 text-amber-700',
                          entry.result === 'error' && 'bg-red-50 text-red-700',
                        )}
                      >
                        {entry.result === 'success' ? 'Éxito' : entry.result === 'warning' ? 'Advertencia' : 'Error'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
