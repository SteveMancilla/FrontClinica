import StatusBadge from '@/components/ui/StatusBadge'
import type { UserStatus } from '@/types/auth'

const labels: Record<UserStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
}

export default function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <StatusBadge
      label={labels[status]}
      variant={status === 'active' ? 'success' : 'neutral'}
    />
  )
}
