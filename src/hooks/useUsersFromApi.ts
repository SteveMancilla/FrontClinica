import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser } from '@/services/authService'
import { getUsers } from '@/services/userService'
import type { SystemUser } from '@/types/auth'
import { getUsersForCurrentUser } from '@/utils/userCatalog'

export function useUsersFromApi() {
  const currentUser = getCurrentUser()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'success'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoadState('loading')
    setLoadError(null)
    try {
      const data = await getUsers()
      setUsers(getUsersForCurrentUser(currentUser, data))
      setLoadState('success')
    } catch (error) {
      setLoadState('error')
      setLoadError(
        error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.',
      )
    }
  }, [currentUser?.id, currentUser?.role])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  return {
    currentUser,
    users,
    setUsers,
    loadState,
    loadError,
    refetch: fetchUsers,
  }
}
