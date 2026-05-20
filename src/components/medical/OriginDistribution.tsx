import type { OriginProductivitySummary } from '@/types/medical'
import ProductivityBars from '@/components/medical/ProductivityBars'

interface OriginDistributionProps {
  items: OriginProductivitySummary[]
}

export default function OriginDistribution({ items }: OriginDistributionProps) {
  const barItems = items.map((o) => ({
    label: o.origin,
    value: o.total,
  }))
  const top = [...items].sort((a, b) => b.total - a.total)[0]

  return (
    <ProductivityBars
      title="Procedencia de pacientes"
      items={barItems}
      highlightLabel={top?.origin}
      emptyMessage="No hay atenciones con procedencia en el periodo."
    />
  )
}
