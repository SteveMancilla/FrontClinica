import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Loader2, Search, Stethoscope, User, UserRound } from 'lucide-react'
import { searchGlobally } from '@/services/globalSearchService'
import { getCurrentUser } from '@/services/authService'
import type { GlobalSearchResult, GlobalSearchResultType } from '@/types/search'

const DEBOUNCE_MS = 320
const MIN_QUERY = 2

const typeLabels: Record<GlobalSearchResultType, string> = {
  patient: 'Paciente',
  report: 'Informe',
  study: 'Estudio',
  doctor: 'Médico',
}

const typeIcons: Record<GlobalSearchResultType, typeof User> = {
  patient: User,
  report: FileText,
  study: Stethoscope,
  doctor: UserRound,
}

export default function GlobalSearch() {
  const listboxId = useId()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)

  const runSearch = useCallback(
    async (value: string) => {
      if (!user) return
      const trimmed = value.trim()
      if (trimmed.length < MIN_QUERY) {
        setResults([])
        setError(null)
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await searchGlobally(trimmed, user)
        setResults(data)
        setActiveIndex(data.length > 0 ? 0 : -1)
      } catch (err) {
        setResults([])
        setError(err instanceof Error ? err.message : 'Error al buscar.')
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      void runSearch(query)
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query, open, runSearch])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const selectResult = (result: GlobalSearchResult) => {
    setOpen(false)
    setQuery('')
    setResults([])
    navigate(result.href)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true)
    }
    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (!results.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % results.length)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
    }
    if (event.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault()
      selectResult(results[activeIndex])
    }
  }

  const trimmed = query.trim()
  const showPanel = open && trimmed.length >= MIN_QUERY

  return (
    <div ref={containerRef} className="relative flex-1 lg:max-w-md">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-clinic-text/40"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-autocomplete="list"
        placeholder="Buscar paciente, DNI, estudio o médico..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 py-2 pr-10 pl-10 text-sm text-clinic-text outline-none transition focus:border-clinic-blue focus:ring-2 focus:ring-clinic-blue/20"
      />
      {loading && (
        <Loader2
          className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-clinic-blue"
          aria-hidden
        />
      )}

      {showPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-full z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-clinic-sky/60 bg-clinic-white py-2 shadow-lg"
        >
          {error && (
            <p className="px-4 py-3 text-sm text-red-600">{error}</p>
          )}
          {!error && !loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-clinic-text/60">
              No hay resultados para «{trimmed}».
            </p>
          )}
          {!error &&
            results.map((result, index) => {
              const Icon = typeIcons[result.type]
              const active = index === activeIndex
              return (
                <button
                  key={result.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectResult(result)}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition ${
                    active ? 'bg-clinic-bg' : 'hover:bg-clinic-bg/80'
                  }`}
                >
                  <span className="mt-0.5 rounded-lg bg-clinic-teal/10 p-1.5 text-clinic-teal">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-clinic-deep-blue">
                      {result.title}
                    </span>
                    <span className="block truncate text-xs text-clinic-text/60">
                      {typeLabels[result.type]} · {result.subtitle}
                    </span>
                  </span>
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}
