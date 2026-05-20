import { FileText, RotateCcw } from 'lucide-react'
import type { PdfSettings } from '@/types/settings'
import SettingsSwitch from '@/components/settings/SettingsSwitch'
import { inputClass, labelClass, sectionCardClass } from '@/utils/settings'

interface PdfSettingsFormProps {
  value: PdfSettings
  onChange: (value: PdfSettings) => void
  readOnly?: boolean
  onRestore?: () => void
}

export default function PdfSettingsForm({
  value,
  onChange,
  readOnly,
  onRestore,
}: PdfSettingsFormProps) {
  const set = <K extends keyof PdfSettings>(key: K, val: PdfSettings[K]) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${sectionCardClass} space-y-4`}>
        <h3 className="font-semibold text-clinic-deep-blue">Generación de PDF</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Tamaño de hoja
            <select disabled className={inputClass} value={value.pageSize}>
              <option value="A4">A4</option>
            </select>
          </label>
          <label className={labelClass}>
            Orientación
            <select
              disabled={readOnly}
              value={value.orientation}
              onChange={(e) => set('orientation', e.target.value as PdfSettings['orientation'])}
              className={inputClass}
            >
              <option value="portrait">Vertical</option>
              <option value="landscape">Horizontal</option>
            </select>
          </label>
        </div>
        <p className="text-sm font-medium text-clinic-text">Márgenes (mm)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['marginTop', 'marginRight', 'marginBottom', 'marginLeft'] as const).map((key, i) => (
            <label key={key} className="text-xs">
              {['Superior', 'Derecho', 'Inferior', 'Izquierdo'][i]}
              <input
                type="number"
                min={0}
                disabled={readOnly}
                value={value[key]}
                onChange={(e) => set(key, Number(e.target.value))}
                className={inputClass}
              />
            </label>
          ))}
        </div>
        <SettingsSwitch label="Incluir firma" checked={value.includeSignature} disabled={readOnly} onChange={(v) => set('includeSignature', v)} />
        <SettingsSwitch label="Incluir código QR" checked={value.includeQrCode} disabled={readOnly} onChange={(v) => set('includeQrCode', v)} />
        <SettingsSwitch label="Incluir marca de agua" checked={value.includeWatermark} disabled={readOnly} onChange={(v) => set('includeWatermark', v)} />
        <label className={labelClass}>
          Patrón de nombre del archivo
          <input
            disabled={readOnly}
            value={value.defaultFileNamePattern}
            onChange={(e) => set('defaultFileNamePattern', e.target.value)}
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-clinic-text/50">
            Ejemplo: informe_maria_quispe_eco_abdomen_2026-05-16.pdf
          </span>
        </label>
        {!readOnly && onRestore && (
          <button type="button" onClick={onRestore} className="inline-flex items-center gap-2 text-sm font-medium text-clinic-blue hover:underline">
            <RotateCcw className="h-4 w-4" /> Restaurar configuración PDF
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className={`${sectionCardClass} border-amber-100 bg-amber-50/40`}>
          <p className="text-sm text-clinic-text">
            El PDF final se generará desde la plantilla HTML del informe y se almacenará en el servidor.
            La base de datos guardará solo la ruta del archivo.
          </p>
        </div>
        <div className={`${sectionCardClass}`}>
          <div className="flex items-center gap-2 text-clinic-deep-blue">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Ubicación de plantilla</span>
          </div>
          <code className="mt-2 block rounded-lg bg-clinic-bg px-3 py-2 text-xs text-clinic-text">
            /storage/informes/2026/05/informe_001.pdf
          </code>
          <button
            type="button"
            className="mt-4 rounded-lg border border-clinic-blue px-4 py-2 text-sm font-medium text-clinic-blue hover:bg-clinic-blue/5"
          >
            Probar vista previa PDF
          </button>
        </div>
      </div>
    </div>
  )
}
