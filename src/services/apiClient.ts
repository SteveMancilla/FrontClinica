export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const REQUEST_TIMEOUT_MS = 25_000

import { readAuthSessionRaw } from '@/utils/authStorage'

function actingUserHeaders(): Record<string, string> {
  const stored = readAuthSessionRaw()
  if (!stored) return {}
  try {
    const user = JSON.parse(stored) as { id?: string }
    return user.id ? { 'X-User-Id': user.id } : {}
  } catch {
    return {}
  }
}

export class ApiError extends Error {
  status: number
  validationErrors?: Record<string, string[]>

  constructor(message: string, status: number, validationErrors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.validationErrors = validationErrors
  }
}

/** Primer mensaje útil de validación del servidor (422) o el mensaje general. */
export function formatApiErrorMessage(error: ApiError): string {
  if (error.validationErrors) {
    for (const messages of Object.values(error.validationErrors)) {
      if (messages[0]) return messages[0]
    }
  }
  return error.message
}

type ApiEnvelope<T> = {
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? ((await response.json()) as ApiEnvelope<T> & T) : null

  if (!response.ok) {
    const validationErrors =
      response.status === 422 && body && 'errors' in body ? body.errors : undefined
    let message =
      (body && 'message' in body && typeof body.message === 'string' ? body.message : null) ??
      `Error HTTP ${response.status}`

    if (validationErrors) {
      for (const messages of Object.values(validationErrors)) {
        if (messages[0]) {
          message = messages[0]
          break
        }
      }
    }

    throw new ApiError(message, response.status, validationErrors)
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T
  }

  return body as T
}

function mapNetworkError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError(
      'La solicitud tardó demasiado. Comprueba la conexión o intenta de nuevo.',
      0,
    )
  }

  if (error instanceof TypeError) {
    return new ApiError(
      'No se pudo conectar con el servidor. Verifica que la API esté en ejecución (php artisan serve).',
      0,
    )
  }

  return new ApiError(
    error instanceof Error ? error.message : 'Error de red al comunicarse con el servidor.',
    0,
  )
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...actingUserHeaders(),
        ...(init?.headers ?? {}),
      },
    })

    return await parseResponse<T>(response)
  } catch (error) {
    throw mapNetworkError(error)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}

function buildApiUrl(path: string): string {
  return path.startsWith('http')
    ? path
    : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Descarga binaria (PDF, etc.) con cabecera de usuario autenticado.
 */
export async function apiDownloadBlob(
  path: string,
  init?: RequestInit,
): Promise<{ blob: Blob; filename: string | null }> {
  const url = buildApiUrl(path)

  const response = await fetch(url, {
    ...init,
    method: init?.method ?? 'GET',
    headers: {
      Accept: 'application/pdf',
      ...actingUserHeaders(),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const body = (await response.json()) as ApiEnvelope<unknown>
      throw new ApiError(
        typeof body.message === 'string' ? body.message : `Error HTTP ${response.status}`,
        response.status,
        body.errors,
      )
    }
    throw new ApiError(`Error HTTP ${response.status}`, response.status)
  }

  const disposition = response.headers.get('content-disposition') ?? ''
  const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(disposition)
  const filename = filenameMatch
    ? decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
    : null

  const blob = await response.blob()

  return { blob, filename }
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
