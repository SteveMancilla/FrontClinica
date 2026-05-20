import type {
  Appointment,
  Doctor,
  MedicalReport,
  Patient,
  Specialty,
  Study,
} from '@/types/medical'

/** Alineado con seed Laravel: Imagenología y Radiología */
export const mockSpecialties: Specialty[] = [
  {
    id: 'spec-img',
    name: 'Imagenología',
    description: 'Estudios de imagen diagnóstica.',
    isActive: true,
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2026-05-10T12:00:00Z',
    iconLabel: 'IMG',
  },
  {
    id: 'spec-rx',
    name: 'Radiología',
    description: 'Estudios radiológicos convencionales.',
    isActive: true,
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2026-05-12T16:00:00Z',
    iconLabel: 'RX',
  },
]

/** Solo estudios reales iniciales (backend: ECO_ABDOMEN_SUPERIOR, RX_TORAX) */
export const mockStudies: Study[] = [
  {
    id: 'ECO-ABD-SUP',
    name: 'Ecografía de abdomen superior',
    specialtyId: 'spec-img',
    templateId: 'tpl_eco_abdomen_superior',
    formatType: 'structured',
    isActive: true,
    code: 'ECO_ABDOMEN_SUPERIOR',
  },
  {
    id: 'RX-TORAX',
    name: 'Radiografía de tórax',
    specialtyId: 'spec-rx',
    templateId: 'tpl_rx_torax',
    formatType: 'narrative',
    isActive: true,
    code: 'RX_TORAX',
  },
]

export const mockDoctors: Doctor[] = [
  {
    id: 'DOC-001',
    fullName: 'Dr. Erlis Arellano Cajachagua',
    specialty: 'Médico Radiólogo',
  },
  {
    id: 'DOC-002',
    fullName: 'Dra. Elena Mendoza',
    specialty: 'Imagenología',
  },
]

export const mockPatients: Patient[] = [
  {
    id: 'pat-001',
    dni: '45678912',
    fullName: 'María Quispe Huamán',
    age: 34,
    sex: 'Femenino',
    phone: '987654321',
    address: 'Av. Los Incas 245, Huancayo',
    origin: 'Particular',
    email: 'maria.quispe@email.com',
    emergencyContactName: 'Carlos Quispe',
    emergencyContactPhone: '987111222',
    notes: 'Alergia a contraste yodado.',
    status: 'active',
    registeredByUserId: '3',
    createdAt: '2026-04-10T08:00:00Z',
  },
  {
    id: 'pat-002',
    dni: '72345618',
    fullName: 'Juan Pérez Mamani',
    age: 52,
    sex: 'Masculino',
    phone: '912345678',
    address: 'Jr. Cusco 890, Huancayo',
    origin: 'Emergencia',
    emergencyContactName: 'Lucía Mamani',
    emergencyContactPhone: '912888777',
    status: 'active',
    createdAt: '2026-04-12T14:30:00Z',
  },
  {
    id: 'pat-003',
    dni: '40125678',
    fullName: 'Rosa Elena Condori Huanca',
    age: 28,
    sex: 'Femenino',
    phone: '956781234',
    address: 'Jr. Túpac Amaru 118',
    origin: 'Consulta externa',
    status: 'active',
    registeredByUserId: '3',
    createdAt: '2026-04-15T09:15:00Z',
  },
  {
    id: 'pat-004',
    dni: '09876543',
    fullName: 'Pedro Antonio Sánchez Vera',
    age: 67,
    sex: 'Masculino',
    phone: '934567890',
    origin: 'Referido',
    status: 'active',
    createdAt: '2026-04-18T11:00:00Z',
  },
  {
    id: 'pat-005',
    dni: '55667788',
    fullName: 'Ana Lucía Paredes Rojas',
    age: 41,
    sex: 'Femenino',
    phone: '978901234',
    origin: 'Convenio',
    email: 'ana.paredes@email.com',
    status: 'active',
    createdAt: '2026-04-20T16:45:00Z',
  },
  {
    id: 'pat-006',
    dni: '33445566',
    fullName: 'Luis Miguel Torres Arias',
    age: 19,
    sex: 'Masculino',
    phone: '965432187',
    address: 'Urb. Las Flores Mz. B Lt. 12',
    origin: 'Hospitalización',
    status: 'active',
    createdAt: '2026-05-01T07:30:00Z',
  },
  {
    id: 'pat-007',
    dni: '71234567',
    fullName: 'Ana Ramos Delgado',
    age: 25,
    sex: 'Femenino',
    phone: '943210987',
    address: 'Av. Giráldez 456',
    origin: 'Particular',
    status: 'active',
    registeredByUserId: '3',
    createdAt: '2026-05-14T10:00:00Z',
  },
  {
    id: 'pat-008',
    dni: '60554433',
    fullName: 'Carmen Luz Huamán Inga',
    age: 45,
    sex: 'Femenino',
    phone: '976543210',
    origin: 'Consulta externa',
    status: 'active',
    createdAt: '2026-05-08T11:20:00Z',
  },
  {
    id: 'pat-009',
    dni: '48901234',
    fullName: 'Roberto Carlos Vega Salas',
    age: 38,
    sex: 'Masculino',
    phone: '951234567',
    address: 'Calle Real 220',
    origin: 'Convenio',
    status: 'inactive',
    notes: 'Paciente inactivo — sin atenciones recientes.',
    createdAt: '2026-03-20T09:00:00Z',
  },
  {
    id: 'pat-010',
    dni: '52345678',
    fullName: 'Yaquelin Quispe Huamán',
    age: 22,
    sex: 'Femenino',
    phone: '988776655',
    origin: 'Particular',
    status: 'active',
    createdAt: '2026-05-10T15:30:00Z',
  },
  {
    id: 'pat-011',
    dni: '66778899',
    fullName: 'Miguel Ángel Flores Ortiz',
    age: 58,
    sex: 'Masculino',
    phone: '933445566',
    origin: 'Emergencia',
    emergencyContactName: 'Patricia Ortiz',
    emergencyContactPhone: '933112233',
    status: 'active',
    createdAt: '2026-05-05T08:45:00Z',
  },
  {
    id: 'pat-012',
    dni: '77889900',
    fullName: 'Sofía Mendoza Ríos',
    age: 31,
    sex: 'Femenino',
    phone: '944556677',
    address: 'Urb. El Carmen Lt. 8',
    origin: 'Referido',
    email: 'sofia.mendoza@email.com',
    status: 'active',
    registeredByUserId: '3',
    createdAt: '2026-05-12T12:00:00Z',
  },
]

const today = new Date().toISOString().slice(0, 10)

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-001',
    patientId: 'pat-001',
    doctorId: 'DOC-002',
    specialtyId: 'spec-img',
    studyId: 'ECO-ABD-SUP',
    appointmentDate: today,
    appointmentTime: '08:30',
    reason: 'Dolor abdominal superior intermitente',
    origin: 'Particular',
    status: 'pending_study',
    createdByRole: 'assistant',
    createdAt: '2026-05-16T07:00:00Z',
  },
  {
    id: 'apt-002',
    patientId: 'pat-002',
    doctorId: 'DOC-001',
    specialtyId: 'spec-rx',
    studyId: 'RX-TORAX',
    appointmentDate: today,
    appointmentTime: '09:15',
    reason: 'Control post traumatismo torácico',
    origin: 'Emergencia',
    status: 'missing_report',
    createdByRole: 'admin',
    createdAt: '2026-05-16T07:30:00Z',
  },
]

export const mockMedicalReports: MedicalReport[] = [
  {
    id: 'rpt-001',
    appointmentId: 'apt-001',
    patientId: 'pat-001',
    doctorId: 'DOC-002',
    studyId: 'ECO-ABD-SUP',
    templateId: 'tpl_eco_abdomen_superior',
    reportDate: today,
    reportTime: '08:30',
    status: 'missing_diagnostic_impression',
    findingsSummary: 'Páncreas y bazo sin alteraciones ecográficas evidentes.',
    createdAt: '2026-05-16T08:45:00Z',
    updatedAt: '2026-05-16T11:00:00Z',
  },
  {
    id: 'rpt-002',
    appointmentId: 'apt-002',
    patientId: 'pat-002',
    doctorId: 'DOC-001',
    studyId: 'RX-TORAX',
    templateId: 'tpl_rx_torax',
    reportDate: today,
    reportTime: '09:15',
    status: 'missing_report',
    createdAt: '2026-05-16T09:20:00Z',
    updatedAt: '2026-05-16T09:20:00Z',
  },
]

export function findMedicalReportById(id: string): MedicalReport | undefined {
  return mockMedicalReports.find((r) => r.id === id)
}

export function findPatientById(id: string): Patient | undefined {
  return mockPatients.find((p) => p.id === id)
}

export function getAppointmentsByPatientId(patientId: string): Appointment[] {
  return mockAppointments.filter((a) => a.patientId === patientId)
}

export function getReportsByPatientId(patientId: string): MedicalReport[] {
  return mockMedicalReports.filter((r) => r.patientId === patientId)
}

export function findDoctorById(id: string): Doctor | undefined {
  return mockDoctors.find((d) => d.id === id)
}

export function findStudyById(id: string): Study | undefined {
  return mockStudies.find((s) => s.id === id)
}

export function findSpecialtyById(id: string): Specialty | undefined {
  return mockSpecialties.find((s) => s.id === id)
}

export function getStudiesBySpecialty(specialtyId: string): Study[] {
  return mockStudies.filter((s) => s.specialtyId === specialtyId)
}

export function cloneSpecialtiesData(): Specialty[] {
  return structuredClone(mockSpecialties)
}

export function getFormatTypeLabel(formatType: Study['formatType']): string {
  return formatType === 'structured'
    ? 'Formato estructurado por secciones'
    : 'Formato narrativo'
}
