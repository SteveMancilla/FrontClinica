import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { AuthError, login } from '@/services/authService'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password, rememberMe)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al iniciar sesión. Intenta nuevamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center bg-clinic-white px-6 py-10 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <header className="mb-10">
            <p className="text-xl font-bold tracking-tight text-clinic-deep-blue">
              Clínica
            </p>
            <p className="mt-1 text-sm text-clinic-text/70">
              Profesionales de la salud a tu servicio
            </p>
          </header>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-clinic-deep-blue sm:text-3xl">
              Acceso al sistema clínico
            </h1>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-clinic-deep-blue"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-clinic-text/40"
                  aria-hidden
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@clinica.com"
                  className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 py-3 pr-4 pl-11 text-clinic-text outline-none transition focus:border-clinic-blue focus:ring-2 focus:ring-clinic-blue/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-clinic-deep-blue"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-clinic-text/40"
                  aria-hidden
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 py-3 pr-11 pl-11 text-clinic-text outline-none transition focus:border-clinic-blue focus:ring-2 focus:ring-clinic-blue/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-clinic-text/50 transition hover:text-clinic-teal"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-clinic-text">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-clinic-sky text-clinic-blue focus:ring-clinic-blue/30"
                />
                Recordarme
              </label>
              <a
                href="#"
                className="font-medium text-clinic-teal transition hover:text-clinic-deep-blue"
                onClick={(e) => e.preventDefault()}
              >
                Olvidé mi contraseña
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-clinic-blue py-3.5 text-sm font-semibold text-clinic-white shadow-md transition hover:bg-clinic-deep-blue focus:ring-2 focus:ring-clinic-blue/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <footer className="mt-10 border-t border-clinic-sky/60 pt-6">
            <p className="flex items-center justify-center gap-2 text-center text-xs text-clinic-text/60">
              <ShieldCheck className="h-4 w-4 shrink-0 text-clinic-teal" />
              Acceso exclusivo para personal autorizado
            </p>
          </footer>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 bg-linear-to-br from-clinic-deep-blue via-clinic-blue to-clinic-teal"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(191,231,229,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          }}
          aria-hidden
        />

        <div
          className="absolute top-16 right-16 h-32 w-32 rounded-full border border-clinic-white/20 bg-clinic-white/5"
          aria-hidden
        />
        <div
          className="absolute top-1/3 left-12 h-24 w-24 rounded-full bg-clinic-sky/20 blur-sm"
          aria-hidden
        />
        <div
          className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full border border-clinic-white/10"
          aria-hidden
        />
        <div
          className="absolute top-1/2 left-1/4 h-px w-48 rotate-45 bg-clinic-white/20"
          aria-hidden
        />

        <div className="absolute top-1/4 right-12 w-52 rounded-xl border border-clinic-white/20 bg-clinic-white/10 p-4 backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-clinic-white/20">
            <Stethoscope className="h-5 w-5 text-clinic-white" />
          </div>
          <p className="text-xs font-medium text-clinic-sky">Informes</p>
          <p className="text-sm text-clinic-white/90">Plantillas clínicas</p>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-14 xl:px-20">
          <h2 className="max-w-md text-3xl leading-tight font-bold text-clinic-white xl:text-4xl">
            Gestión inteligente de informes médicos
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-clinic-sky/95">
            Dictado por voz, plantillas clínicas y productividad médica en un
            solo sistema.
          </p>
        </div>

        <div className="absolute right-10 bottom-10 z-10 rounded-xl bg-clinic-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-clinic-blue">
              <ShieldCheck className="h-5 w-5 text-clinic-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-clinic-deep-blue">
                Sistema seguro
              </p>
              <p className="text-xs text-clinic-text/70">
                Diagnóstico por imágenes
              </p>
            </div>
          </div>
          <div className="mt-3 h-0.5 w-full rounded-full bg-clinic-teal" />
        </div>
      </div>
    </div>
  )
}
