export type GlobalSearchResultType = 'patient' | 'report' | 'study' | 'doctor'

export interface GlobalSearchResult {
  id: string
  type: GlobalSearchResultType
  title: string
  subtitle: string
  href: string
}

export interface AppNotification {
  id: string
  title: string
  message: string
  href: string
  priority: 'high' | 'medium' | 'low'
  createdAt: string
}
