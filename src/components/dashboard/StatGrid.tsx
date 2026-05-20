import type { ReactNode } from 'react'
import SummaryCard from '@/components/ui/SummaryCard'

export interface StatGridItem {
  title: string
  value: number | string
  icon: ReactNode
  detail?: string
  accent?: 'default' | 'warning' | 'success' | 'info' | 'danger' | 'purple'
}

interface StatGridProps {
  items: StatGridItem[]
  columns?: 2 | 3 | 4
}

const colClass = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 xl:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
}

export default function StatGrid({ items, columns = 4 }: StatGridProps) {
  return (
    <div className={`grid gap-4 ${colClass[columns]}`}>
      {items.map((item) => (
        <SummaryCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          detail={item.detail}
          accent={item.accent}
        />
      ))}
    </div>
  )
}
