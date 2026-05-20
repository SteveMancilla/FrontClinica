import { useCallback, useEffect, useState } from 'react'
import { getNotifications } from '@/services/notificationService'
import { getCurrentUser } from '@/services/authService'
import type { AppNotification } from '@/types/search'

export function useNotifications() {
  const user = getCurrentUser()
  const userId = user?.id

  const [items, setItems] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([])
      setUnreadCount(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getNotifications()
      setItems(result.items)
      setUnreadCount(result.unreadCount)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones.',
      )
      setItems([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, error, refresh, unreadCount }
}
