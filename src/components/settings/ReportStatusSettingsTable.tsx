import { AlertTriangle } from 'lucide-react'
import type { ReportStatusItem, ReportStatusSettings } from '@/types/settings'
import StatusBadge from '@/components/ui/StatusBadge'
import { inputClass, sectionCardClass } from '@/utils/settings'

interface ReportStatusSettingsTableProps {
  value: ReportStatusSettings
  onChange: (value: ReportStatusSettings) => void
  readOnly?: boolean
}

export default function ReportStatusSettingsTable({
  value,
  onChange,
  readOnly,
}: ReportStatusSettingsTableProps) {
  const updateStatus = (key: string, patch: Partial<ReportStatusItem>) => {
    onChange({
      statuses: value.statuses.map((s) => (s.key === key ? { ...s, ...patch } : s)),
    })
  }

  const sorted = [...value.statuses].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>Cambiar estados puede afectar la lectura de bandejas e indicadores de productividad.</p>
      </div>

      <div className={`${sectionCardClass} overflow-x-auto`}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-clinic-sky/50 text-xs uppercase text-clinic-text/50">
              <th className="px-3 py-2">Clave</th>
              <th className="px-3 py-2">Nombre visible</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Activo</th>
              <th className="px-3 py-2">Color</th>
              <th className="px-3 py-2">Orden</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((status) => (
              <tr key={status.key} className="border-b border-clinic-sky/30 last:border-0">
                <td className="px-3 py-3 font-mono text-xs text-clinic-text/70">{status.key}</td>
                <td className="px-3 py-3">
                  <input
                    disabled={readOnly}
                    value={status.label}
                    onChange={(e) => updateStatus(status.key, { label: e.target.value })}
                    className={inputClass}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    disabled={readOnly}
                    value={status.description}
                    onChange={(e) => updateStatus(status.key, { description: e.target.value })}
                    className={inputClass}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={status.enabled}
                    onChange={(e) => updateStatus(status.key, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-clinic-sky text-clinic-teal"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={readOnly}
                      value={status.color}
                      onChange={(e) => updateStatus(status.key, { color: e.target.value })}
                      className="h-8 w-10 cursor-pointer rounded border border-clinic-sky"
                    />
                    <StatusBadge label={status.label} variant="neutral" />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min={1}
                    disabled={readOnly}
                    value={status.order}
                    onChange={(e) => updateStatus(status.key, { order: Number(e.target.value) })}
                    className={`${inputClass} w-16`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
