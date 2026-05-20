import { Check } from 'lucide-react'
import type { UserRole } from '@/types/auth'
import { rolePermissions } from '@/utils/userCatalog'

export default function UserPermissionsCard({ role }: { role: UserRole }) {
  const permissions = rolePermissions[role]

  return (
    <section className="rounded-xl border border-clinic-sky/50 bg-clinic-bg/30 p-4">
      <h3 className="text-sm font-semibold text-clinic-deep-blue">Permisos del rol</h3>
      <ul className="mt-3 space-y-2">
        {permissions.map((perm) => (
          <li key={perm} className="flex items-start gap-2 text-sm text-clinic-text">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-clinic-teal" />
            {perm}
          </li>
        ))}
      </ul>
    </section>
  )
}
