export const AUTH_STORAGE_KEY = 'clinica_auth'

const LEGACY_AUTH_STORAGE_KEY = 'clinica_zarate_auth'

/** Migra sesiones guardadas con la clave anterior del proyecto. */
export function migrateLegacyAuthStorage(): void {
  for (const storage of [localStorage, sessionStorage]) {
    const legacy = storage.getItem(LEGACY_AUTH_STORAGE_KEY)
    if (legacy && !storage.getItem(AUTH_STORAGE_KEY)) {
      storage.setItem(AUTH_STORAGE_KEY, legacy)
    }
    storage.removeItem(LEGACY_AUTH_STORAGE_KEY)
  }
}

export function readAuthSessionRaw(): string | null {
  migrateLegacyAuthStorage()
  return localStorage.getItem(AUTH_STORAGE_KEY) ?? sessionStorage.getItem(AUTH_STORAGE_KEY)
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
  sessionStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
}

export function writeAuthSession(json: string, remember: boolean): void {
  migrateLegacyAuthStorage()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(AUTH_STORAGE_KEY, json)
  if (remember) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
  sessionStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
}

export function patchAuthSession(patch: Record<string, unknown>): void {
  const raw = readAuthSessionRaw()
  if (!raw) return

  try {
    const current = JSON.parse(raw) as Record<string, unknown>
    const storage = localStorage.getItem(AUTH_STORAGE_KEY) ? localStorage : sessionStorage
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...current, ...patch }))
  } catch {
    clearAuthSession()
  }
}
