import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface QuickActionCardProps {
  label: string
  to: string
  icon: LucideIcon
}

export default function QuickActionCard({ label, to, icon: Icon }: QuickActionCardProps) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 text-center text-sm font-medium text-clinic-text shadow-sm transition-colors hover:border-clinic-blue hover:bg-clinic-bg/50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinic-blue/10 text-clinic-blue">
        <Icon className="h-5 w-5" />
      </span>
      {label}
    </Link>
  )
}
