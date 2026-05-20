import clsx from 'clsx'
import type { OperationalTask } from '@/utils/dashboard'

interface OperationalTasksListProps {
  tasks: OperationalTask[]
}

const statusStyles = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
}

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  completed: 'Completado',
}

export default function OperationalTasksList({ tasks }: OperationalTasksListProps) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-clinic-sky/40 bg-clinic-bg/30 px-4 py-3"
        >
          <span className="text-sm font-medium text-clinic-text">{task.label}</span>
          <span
            className={clsx(
              'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              statusStyles[task.status],
            )}
          >
            {statusLabels[task.status]}
          </span>
        </li>
      ))}
    </ul>
  )
}
