import type { ActivityLogEntry, SystemSettings } from '@/types/settings'

export const defaultSystemSettings: SystemSettings = {
  clinic: {
    clinicName: 'Clínica',
    slogan: 'Profesionales de la salud a tu servicio',
    ruc: '20123456789',
    address: 'Av. Uruguay N° 533 San Carlos – Huancayo',
    city: 'Huancayo',
    phone: '920828201 / (064) 263490',
    emergencyPhone: '999742222',
    email: 'contacto@clinica.com',
    website: 'www.clinica.com',
    logoUrl: undefined,
  },
  reportHeader: {
    showLogo: true,
    showSlogan: true,
    showAddress: true,
    showPhone: true,
    showDoctorCmp: true,
    showDoctorRne: true,
    showMedicalSignature: true,
    showValidationFooter: true,
    headerTitle: 'Informe médico',
    footerText: 'Este informe debe ser interpretado por un profesional de salud.',
    legalNote:
      'Documento confidencial. La interpretación clínica corresponde exclusivamente al médico tratante.',
  },
  pdf: {
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 20,
    marginRight: 15,
    marginBottom: 20,
    marginLeft: 15,
    includeSignature: true,
    includeQrCode: false,
    includeWatermark: false,
    defaultFileNamePattern: 'informe_{paciente}_{estudio}_{fecha}.pdf',
  },
  voiceDictation: {
    enabled: true,
    language: 'es-PE',
    autoNormalizeText: true,
    appendDictationToSection: true,
    showListeningAnimation: true,
    maxRecordingMinutes: 10,
    allowManualEditing: true,
  },
  aiDiagnostic: {
    enabled: true,
    provider: 'ollama',
    modelName: 'deepseek-v4-pro:cloud',
    endpointUrl: 'http://127.0.0.1:11434',
    generateOnlyOnButton: true,
    requireDoctorValidation: true,
    allowRegenerate: true,
    includeClinicalWarning: true,
    promptRules: `Reglas para impresión diagnóstica sugerida:
- No inventar hallazgos no dictados por el médico.
- No reemplazar el criterio médico del profesional.
- No indicar tratamiento ni medicación.
- Responder en formato numerado y conciso.
- Usar lenguaje médico breve y claro.
- Basarse únicamente en los hallazgos dictados.
- Si hay contradicción en los hallazgos, solicitar revisión médica.`,
  },
  reportStatuses: {
    statuses: [
      {
        key: 'missing_report',
        label: 'Falta informe',
        description: 'El médico aún no completó los hallazgos del estudio.',
        enabled: true,
        color: '#EF4444',
        order: 1,
      },
      {
        key: 'missing_diagnostic_impression',
        label: 'Falta impresión',
        description: 'Existen hallazgos, pero falta la impresión diagnóstica.',
        enabled: true,
        color: '#F59E0B',
        order: 2,
      },
      {
        key: 'in_review',
        label: 'En revisión',
        description: 'Informe con hallazgos e impresión, pendiente de validación final.',
        enabled: true,
        color: '#3B82F6',
        order: 3,
      },
      {
        key: 'concluded',
        label: 'Concluido',
        description: 'Informe validado por el médico responsable.',
        enabled: true,
        color: '#2F8F86',
        order: 4,
      },
      {
        key: 'pdf_generated',
        label: 'PDF generado',
        description: 'Informe emitido en PDF y listo para entrega.',
        enabled: true,
        color: '#16486B',
        order: 5,
      },
    ],
  },
  security: {
    sessionTimeoutMinutes: 60,
    requirePasswordChangeOnFirstLogin: true,
    allowRememberMe: true,
    maxLoginAttempts: 5,
    enableActivityLog: true,
    enableTwoFactorVisualOnly: false,
  },
  appearance: {
    primaryColor: '#1F5D85',
    secondaryColor: '#2F8F86',
    compactMode: false,
    darkModeEnabled: false,
    fontSize: 'medium',
    showCardShadows: true,
    compactSidebar: false,
  },
}

export const mockActivityLog: ActivityLogEntry[] = [
  {
    id: 'log-1',
    userName: 'Dr. Erlis Arellano',
    action: 'Ingresó al sistema',
    module: 'Autenticación',
    timestamp: '2026-05-16T08:12:00',
    result: 'success',
  },
  {
    id: 'log-2',
    userName: 'Dra. Elena Mendoza',
    action: 'Generó impresión diagnóstica sugerida',
    module: 'Nuevo informe',
    timestamp: '2026-05-16T09:45:00',
    result: 'success',
  },
  {
    id: 'log-3',
    userName: 'Ana Ramírez',
    action: 'Registró paciente',
    module: 'Pacientes',
    timestamp: '2026-05-16T10:02:00',
    result: 'success',
  },
  {
    id: 'log-4',
    userName: 'Dr. Carlos Huamán',
    action: 'Concluyó informe',
    module: 'Informes',
    timestamp: '2026-05-16T11:30:00',
    result: 'success',
  },
  {
    id: 'log-5',
    userName: 'Admin Sistema',
    action: 'Intento de acceso fallido',
    module: 'Autenticación',
    timestamp: '2026-05-15T22:18:00',
    result: 'warning',
  },
]

export function cloneSettingsData(): SystemSettings {
  return JSON.parse(JSON.stringify(defaultSystemSettings)) as SystemSettings
}
