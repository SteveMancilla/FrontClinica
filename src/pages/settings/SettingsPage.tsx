import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Eye,
  Info,
  Loader2,
  RotateCcw,
  Save,
  Settings,
  ShieldAlert,
} from 'lucide-react'
import AiDiagnosticSettingsForm from '@/components/settings/AiDiagnosticSettingsForm'
import AppearanceSettingsPanel from '@/components/settings/AppearanceSettingsPanel'
import ClinicSettingsForm from '@/components/settings/ClinicSettingsForm'
import PageHeader from '@/components/layout/PageHeader'
import MaintenancePanel from '@/components/settings/MaintenancePanel'
import PdfSettingsForm from '@/components/settings/PdfSettingsForm'
import ReportSettingsForm from '@/components/settings/ReportSettingsForm'
import ReportStatusSettingsTable from '@/components/settings/ReportStatusSettingsTable'
import SecuritySettingsPanel from '@/components/settings/SecuritySettingsPanel'
import SettingsSectionNav from '@/components/settings/SettingsSectionNav'
import VoiceSettingsForm from '@/components/settings/VoiceSettingsForm'
import { cloneSettingsData, defaultSystemSettings } from '@/data/mockSettings'
import { getCurrentUser } from '@/services/authService'
import { ApiError, formatApiErrorMessage } from '@/services/apiClient'
import { getSystemSettings, saveSystemSettings } from '@/services/settingsService'
import type { SettingsSectionId, SystemSettings } from '@/types/settings'
import {
  allSettingsSections,
  canEditSection,
  canEditSettings,
  getSectionsForRole,
} from '@/utils/settings'

export default function SettingsPage() {
  const user = getCurrentUser()
  const role = user?.role ?? 'assistant'
  const isAdmin = role === 'admin'
  const isDoctor = role === 'doctor'
  const canEditGlobal = canEditSettings(role)

  const allowedSectionIds = getSectionsForRole(role)
  const navSections = useMemo(
    () => allSettingsSections.filter((s) => allowedSectionIds.includes(s.id)),
    [allowedSectionIds],
  )

  const [settings, setSettings] = useState<SystemSettings>(() => cloneSettingsData())
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(
    allowedSectionIds[0] ?? 'clinic',
  )
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await getSystemSettings()
      setSettings(data)
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? formatApiErrorMessage(err)
          : 'No se pudo cargar la configuración.',
      )
      setSettings(cloneSettingsData())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (role !== 'assistant') {
      void loadSettings()
    }
  }, [loadSettings, role])

  useEffect(() => {
    if (!allowedSectionIds.includes(activeSection) && allowedSectionIds[0]) {
      setActiveSection(allowedSectionIds[0])
    }
  }, [activeSection, allowedSectionIds])

  const sectionReadOnly = (section: SettingsSectionId) => !canEditSection(role, section)

  const handleSave = async () => {
    setIsSaving(true)
    setLoadError(null)
    try {
      const saved = await saveSystemSettings(settings)
      setSettings(saved)
      setSavedMessage('Configuración guardada correctamente.')
      setTimeout(() => setSavedMessage(null), 4000)
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? formatApiErrorMessage(err)
          : 'No se pudo guardar la configuración.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestoreAll = async () => {
    const defaults = cloneSettingsData()
    setIsSaving(true)
    setLoadError(null)
    try {
      const saved = await saveSystemSettings(defaults)
      setSettings(saved)
      setSavedMessage('Valores restaurados y guardados.')
      setTimeout(() => setSavedMessage(null), 4000)
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? formatApiErrorMessage(err)
          : 'No se pudo restaurar la configuración.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const restoreClinic = () => {
    setSettings((s) => ({ ...s, clinic: { ...defaultSystemSettings.clinic } }))
  }

  const restorePdf = () => {
    setSettings((s) => ({ ...s, pdf: { ...defaultSystemSettings.pdf } }))
  }

  if (role === 'assistant') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader description="Parámetros del sistema Clínica" />
        <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-lg font-semibold text-clinic-deep-blue">
            Sin permisos de configuración
          </h2>
          <p className="mt-2 text-sm text-clinic-text/70">
            No tienes permisos para modificar la configuración del sistema.
          </p>
        </div>
        <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-6 text-sm">
          <p><span className="font-medium">Sistema:</span> Clínica — Diagnóstico por imágenes</p>
          <p className="mt-2"><span className="font-medium">Soporte:</span> contacto@clinica.com</p>
          <p className="mt-2"><span className="font-medium">Versión:</span> 1.0.0</p>
          <p className="mt-2"><span className="font-medium">Tu rol:</span> Asistente</p>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'clinic':
        return (
          <ClinicSettingsForm
            value={settings.clinic}
            onChange={(clinic) => setSettings((s) => ({ ...s, clinic }))}
            readOnly={sectionReadOnly('clinic')}
            onRestore={isAdmin ? restoreClinic : undefined}
          />
        )
      case 'reports':
        return (
          <ReportSettingsForm
            value={settings.reportHeader}
            clinic={settings.clinic}
            onChange={(reportHeader) => setSettings((s) => ({ ...s, reportHeader }))}
            readOnly={sectionReadOnly('reports')}
          />
        )
      case 'pdf':
        return (
          <PdfSettingsForm
            value={settings.pdf}
            onChange={(pdf) => setSettings((s) => ({ ...s, pdf }))}
            readOnly={sectionReadOnly('pdf')}
            onRestore={isAdmin ? restorePdf : undefined}
          />
        )
      case 'voice':
        return (
          <VoiceSettingsForm
            value={settings.voiceDictation}
            onChange={(voiceDictation) => setSettings((s) => ({ ...s, voiceDictation }))}
            readOnly={sectionReadOnly('voice')}
          />
        )
      case 'ai':
        return (
          <AiDiagnosticSettingsForm
            value={settings.aiDiagnostic}
            onChange={(aiDiagnostic) => setSettings((s) => ({ ...s, aiDiagnostic }))}
            readOnly={sectionReadOnly('ai')}
          />
        )
      case 'statuses':
        return (
          <ReportStatusSettingsTable
            value={settings.reportStatuses}
            onChange={(reportStatuses) => setSettings((s) => ({ ...s, reportStatuses }))}
            readOnly={sectionReadOnly('statuses')}
          />
        )
      case 'security':
        return (
          <SecuritySettingsPanel
            value={settings.security}
            onChange={(security) => setSettings((s) => ({ ...s, security }))}
            readOnly={sectionReadOnly('security')}
          />
        )
      case 'appearance':
        return (
          <AppearanceSettingsPanel
            value={settings.appearance}
            onChange={(appearance) => setSettings((s) => ({ ...s, appearance }))}
            readOnly={sectionReadOnly('appearance')}
          />
        )
      case 'maintenance':
        return <MaintenancePanel />
      default:
        return null
    }
  }

  const sectionTitle = navSections.find((s) => s.id === activeSection)?.label ?? 'Configuración'
  const canEditActive = canEditSection(role, activeSection)

  return (
    <div className="space-y-6">
      <PageHeader description="Administra los parámetros generales del sistema, informes médicos, dictado por voz e IA diagnóstica.">
        {(canEditGlobal || canEditActive || isDoctor) && (
          <>
            {(canEditGlobal || canEditActive) && (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            )}
            {canEditGlobal && (
            <button
              type="button"
              onClick={() => void handleRestoreAll()}
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-clinic-sky bg-clinic-white px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar valores
            </button>
            )}
            {(canEditGlobal || isDoctor) && (
            <button
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-clinic-sky bg-clinic-white px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg"
            >
              <Eye className="h-4 w-4" /> Vista previa informe
            </button>
            )}
          </>
        )}
      </PageHeader>

      {isDoctor && (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Info className="h-5 w-5 shrink-0" />
          <p>
            La configuración global solo puede ser modificada por el administrador.
            Puedes ajustar dictado y apariencia según tus preferencias.
          </p>
        </div>
      )}

      <div className="flex gap-3 rounded-lg border border-clinic-sky/50 bg-clinic-teal/5 px-4 py-3 text-sm text-clinic-text">
        <Settings className="h-5 w-5 shrink-0 text-clinic-teal" />
        <p>
          Estos parámetros controlan cómo se muestran los informes, cómo funciona el dictado por voz
          y cómo se genera la impresión diagnóstica sugerida.
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-clinic-text/70">
          <Loader2 className="h-4 w-4 animate-spin text-clinic-blue" />
          Cargando configuración…
        </div>
      )}

      {savedMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {savedMessage}
        </div>
      )}

      {previewOpen && (
        <div className="rounded-xl border border-clinic-blue/30 bg-clinic-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-clinic-teal">Vista previa rápida del informe</p>
          <div className="mt-3 rounded-lg border border-clinic-sky/50 bg-clinic-bg/40 p-4 text-sm">
            <p className="font-bold text-clinic-deep-blue">{settings.clinic.clinicName}</p>
            {settings.reportHeader.showSlogan && (
              <p className="text-xs italic text-clinic-text/60">{settings.clinic.slogan}</p>
            )}
            <p className="mt-3 font-semibold">{settings.reportHeader.headerTitle}</p>
            <p className="mt-2 text-clinic-text/70">Paciente: María Quispe · Estudio: Ecografía abdomen superior</p>
            <p className="mt-4 text-xs text-clinic-text/50">{settings.reportHeader.footerText}</p>
          </div>
        </div>
      )}

      <div className="lg:hidden">
        <SettingsSectionNav
          sections={navSections}
          active={activeSection}
          onChange={setActiveSection}
          variant="tabs"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-xl border border-clinic-sky/50 bg-clinic-white p-3 shadow-sm lg:block">
          <SettingsSectionNav
            sections={navSections}
            active={activeSection}
            onChange={setActiveSection}
          />
        </aside>

        <main className="min-w-0 space-y-4">
          <h2 className="text-lg font-semibold text-clinic-deep-blue">{sectionTitle}</h2>
          {renderSection()}
        </main>
      </div>
    </div>
  )
}
