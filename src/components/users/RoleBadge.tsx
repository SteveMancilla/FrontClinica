import clsx from 'clsx'
import type { UserRole } from '@/types/auth'
import { roleLabels } from '@/utils/userCatalog'

const roleStyles: Record<UserRole, string> = {
  admin: 'bg-clinic-deep-blue/10 text-clinic-deep-blue border-clinic-deep-blue/20',
  doctor: 'bg-clinic-blue/10 text-clinic-blue border-blue-100',
  assistant: 'bg-clinic-teal/10 text-clinic-teal border-teal-100',
}

export default function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
        roleStyles[role],
      )}
    >
      {roleLabels[role]}
    </span>
  )
}
