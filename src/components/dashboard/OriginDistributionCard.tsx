import type { OriginDistributionItem } from '@/utils/dashboard'

interface OriginDistributionCardProps {
  items: OriginDistributionItem[]
}

export default function OriginDistributionCard({ items }: OriginDistributionCardProps) {
  const max = Math.max(...items.map((i) => i.count), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.origin}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-clinic-text">{item.origin}</span>
            <span className="font-medium text-clinic-deep-blue">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-clinic-bg">
            <div
              className="h-full rounded-full bg-clinic-teal"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
