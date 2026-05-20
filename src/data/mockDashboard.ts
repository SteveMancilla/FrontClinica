export interface DashboardStats {
  pendingReports: number
  missingDiagnosis: number
  completedReports: number
  patientsToday: number
}

export const mockDashboardStats: DashboardStats = {
  pendingReports: 12,
  missingDiagnosis: 5,
  completedReports: 28,
  patientsToday: 18,
}
