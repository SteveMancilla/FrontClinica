import type { ReactNode } from 'react'
import {
  Database,
  Download,
  FileCheck,
  HardDrive,
  RefreshCw,
  Server,
  Sparkles,
} from 'lucide-react'
import SummaryCard from '@/components/ui/SummaryCard'
import { sectionCardClass } from '@/utils/settings'

const SYSTEM_CARDS = [
  {
    title: 'Base de datos',
    value: 'PostgreSQL',
    detail: 'Datos clínicos en producción',
    icon: <Database className="h-5 w-5" />,
  },
  {
    title: 'API',
    value: 'Conectada',
    detail: 'Pacientes, informes y usuarios',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Frontend',
    value: 'React',
    detail: 'Interfaz clínica operativa',
    icon: <HardDrive className="h-5 w-5" />,
  },
  {
    title: 'IA',
    value: 'Ollama',
    detail: 'Impresión diagnóstica asistida',
    icon: <Sparkles className="h-5 w-5" />,
  },
]

export default function MaintenancePanel() {
  return (
    <div className="space-y-6">
      <div className={`${sectionCardClass} border-clinic-teal/30 bg-clinic-teal/5`}>
        <p className="text-sm font-medium text-clinic-deep-blue">Estado del sistema</p>
        <p className="mt-1 text-sm text-clinic-text/70">
          El sistema opera con base de datos y API activas. Algunas opciones de esta sección
          (respaldos automáticos, exportación masiva) se habilitarán en versiones futuras.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SYSTEM_CARDS.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            detail={card.detail}
            icon={card.icon}
            accent="info"
          />
        ))}
      </div>

      <div className={`${sectionCardClass}`}>
        <h3 className="mb-4 font-semibold text-clinic-deep-blue">Respaldo y mantenimiento</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ActionBtn icon={<Download className="h-4 w-4" />} label="Generar respaldo" />
          <ActionBtn icon={<Download className="h-4 w-4" />} label="Exportar configuración" />
          <ActionBtn icon={<RefreshCw className="h-4 w-4" />} label="Importar configuración" />
          <ActionBtn icon={<FileCheck className="h-4 w-4" />} label="Revisar plantillas incompletas" />
          <ActionBtn icon={<FileCheck className="h-4 w-4" />} label="Revisar informes pendientes" />
          <ActionBtn icon={<RefreshCw className="h-4 w-4" />} label="Revisar integridad" />
          <ActionBtn icon={<HardDrive className="h-4 w-4" />} label="Limpiar borradores antiguos" />
          <ActionBtn icon={<Server className="h-4 w-4" />} label="Ver logs del sistema" />
        </div>
      </div>

      <div className={`${sectionCardClass} text-sm text-clinic-text/80`}>
        <p className="font-medium text-clinic-deep-blue">Informes PDF</p>
        <p className="mt-1">
          Los informes se generan desde el módulo de informes médicos con el formato institucional
          configurado.
        </p>
      </div>
    </div>
  )
}

function ActionBtn({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm font-medium text-clinic-deep-blue hover:bg-clinic-bg"
    >
      {icon}
      {label}
    </button>
  )
}
