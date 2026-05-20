import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Stethoscope,
  UserCircle,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react'
import type { UserRole } from '@/types/auth'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Pacientes', path: '/patients', icon: Users },
  { label: 'Informes', path: '/reports', icon: FileText },
  { label: 'Productividad médica', path: '/productivity', icon: BarChart3 },
  { label: 'Estudios y plantillas', path: '/templates', icon: ClipboardList },
  { label: 'Especialidades', path: '/specialties', icon: Stethoscope },
  { label: 'Usuarios', path: '/users', icon: UsersRound },
  { label: 'Configuración', path: '/settings', icon: Settings },
  { label: 'Mi perfil', path: '/profile', icon: UserCircle },
]

const doctorNav: NavItem[] = [
  { label: 'Mi dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Pacientes', path: '/patients', icon: Users },
  { label: 'Informes', path: '/reports', icon: FileText },
  { label: 'Mis asistentes', path: '/assistants', icon: UsersRound },
  { label: 'Mi productividad', path: '/productivity', icon: BarChart3 },
  { label: 'Estudios y plantillas', path: '/templates', icon: ClipboardList },
  { label: 'Especialidades', path: '/specialties', icon: Stethoscope },
  { label: 'Configuración', path: '/settings', icon: Settings },
  { label: 'Mi perfil', path: '/profile', icon: UserCircle },
]

const assistantNav: NavItem[] = [
  { label: 'Mi dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Registrar paciente', path: '/patients/new', icon: UserPlus },
  { label: 'Informes', path: '/reports', icon: FileText },
  { label: 'Pacientes registrados', path: '/patients', icon: Users },
  { label: 'Estudios y plantillas', path: '/templates', icon: ClipboardList },
  { label: 'Especialidades', path: '/specialties', icon: Stethoscope },
  { label: 'Mi perfil', path: '/profile', icon: UserCircle },
]

const navByRole: Record<UserRole, NavItem[]> = {
  admin: adminNav,
  doctor: doctorNav,
  assistant: assistantNav,
}

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navByRole[role]
}

export const routeTitles: Record<string, string> = {
  '/dashboard': 'Panel General',
  '/appointments': 'Atenciones y estudios',
  '/patients': 'Pacientes',
  '/patients/new': 'Registrar paciente',
  '/reports': 'Bandeja de informes',
  '/reports/new': 'Nuevo informe médico',
  '/productivity': 'Productividad médica',
  '/templates': 'Estudios y plantillas',
  '/specialties': 'Especialidades',
  '/users': 'Usuarios',
  '/settings': 'Configuración',
  '/profile': 'Mi perfil',
  '/assistants': 'Mis asistentes',
}

export function getPageTitle(pathname: string, role?: UserRole): string {
  if (pathname === '/productivity' && role === 'doctor') {
    return 'Mi productividad'
  }
  if (pathname === '/dashboard' && role === 'doctor') {
    return 'Mi dashboard'
  }
  if (pathname === '/dashboard' && role === 'assistant') {
    return 'Mi dashboard'
  }
  if (routeTitles[pathname]) return routeTitles[pathname]
  if (pathname.startsWith('/patients/') && pathname !== '/patients/new') {
    return 'Ficha del paciente'
  }
  const base = '/' + pathname.split('/').filter(Boolean)[0]
  if (routeTitles[base]) return routeTitles[base]
  return 'Sistema Clínica'
}
