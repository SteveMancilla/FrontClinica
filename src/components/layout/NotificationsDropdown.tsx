import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Loader2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationsDropdown() {
  const { items, loading, error, refresh, unreadCount } = useNotifications()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) void refresh()
        }}
        className="relative rounded-lg p-2 text-clinic-text hover:bg-clinic-bg"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-clinic-sky/60 bg-clinic-white shadow-lg sm:w-96"
          role="dialog"
          aria-label="Notificaciones"
        >
          <div className="border-b border-clinic-sky/40 px-4 py-3">
            <p className="text-sm font-semibold text-clinic-deep-blue">Notificaciones</p>
            <p className="text-xs text-clinic-text/60">Informes que requieren atención</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-clinic-text/60">
                <Loader2 className="h-4 w-4 animate-spin text-clinic-blue" />
                Cargando…
              </div>
            )}
            {error && !loading && (
              <p className="px-4 py-6 text-sm text-red-600">{error}</p>
            )}
            {!loading && !error && items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-clinic-text/60">
                No tienes informes pendientes por el momento.
              </p>
            )}
            {!loading &&
              !error &&
              items.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-clinic-sky/30 px-4 py-3 transition last:border-0 hover:bg-clinic-bg"
                >
                  <p className="text-sm font-medium text-clinic-deep-blue">{item.title}</p>
                  <p className="mt-0.5 text-xs text-clinic-text/60">{item.message}</p>
                  <p className="mt-1 text-[10px] text-clinic-text/40">
                    {new Date(item.createdAt).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </Link>
              ))}
          </div>

          {items.length > 0 && (
            <div className="border-t border-clinic-sky/40 px-4 py-2">
              <Link
                to="/reports"
                onClick={() => setOpen(false)}
                className="block py-2 text-center text-xs font-semibold text-clinic-teal hover:underline"
              >
                Ver bandeja de informes
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
