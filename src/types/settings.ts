export interface ClinicSettings {
  clinicName: string
  slogan: string
  ruc?: string
  address: string
  city: string
  phone: string
  emergencyPhone: string
  email: string
  website?: string
  logoUrl?: string
}

export interface ReportHeaderSettings {
  showLogo: boolean
  showSlogan: boolean
  showAddress: boolean
  showPhone: boolean
  showDoctorCmp: boolean
  showDoctorRne: boolean
  showMedicalSignature: boolean
  showValidationFooter: boolean
  headerTitle: string
  footerText: string
  legalNote?: string
}

export interface PdfSettings {
  pageSize: 'A4'
  orientation: 'portrait' | 'landscape'
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  includeSignature: boolean
  includeQrCode: boolean
  includeWatermark: boolean
  defaultFileNamePattern: string
}

export interface VoiceDictationSettings {
  enabled: boolean
  language: string
  autoNormalizeText: boolean
  appendDictationToSection: boolean
  showListeningAnimation: boolean
  maxRecordingMinutes: number
  allowManualEditing: boolean
}

export type AiProvider = 'mock' | 'ollama' | 'backend'

export interface AiDiagnosticSettings {
  enabled: boolean
  provider: AiProvider
  modelName: string
  endpointUrl: string
  generateOnlyOnButton: boolean
  requireDoctorValidation: boolean
  allowRegenerate: boolean
  includeClinicalWarning: boolean
  promptRules: string
}

export interface ReportStatusItem {
  key: string
  label: string
  description: string
  enabled: boolean
  color: string
  order: number
}

export interface ReportStatusSettings {
  statuses: ReportStatusItem[]
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number
  requirePasswordChangeOnFirstLogin: boolean
  allowRememberMe: boolean
  maxLoginAttempts: number
  enableActivityLog: boolean
  enableTwoFactorVisualOnly: boolean
}

export type FontSizeOption = 'small' | 'medium' | 'large'

export interface AppearanceSettings {
  primaryColor: string
  secondaryColor: string
  compactMode: boolean
  darkModeEnabled: boolean
  fontSize: FontSizeOption
  showCardShadows: boolean
  compactSidebar: boolean
}

export interface ActivityLogEntry {
  id: string
  userName: string
  action: string
  module: string
  timestamp: string
  result: 'success' | 'warning' | 'error'
}

export interface SystemSettings {
  clinic: ClinicSettings
  reportHeader: ReportHeaderSettings
  pdf: PdfSettings
  voiceDictation: VoiceDictationSettings
  aiDiagnostic: AiDiagnosticSettings
  reportStatuses: ReportStatusSettings
  security: SecuritySettings
  appearance: AppearanceSettings
}

export type SettingsSectionId =
  | 'clinic'
  | 'reports'
  | 'pdf'
  | 'voice'
  | 'ai'
  | 'statuses'
  | 'security'
  | 'appearance'
  | 'maintenance'
