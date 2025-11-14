import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { useUIStore } from './stores/useUIStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { ToastContainer, SafariBanner, BottomNav } from './components/ui'
import { ProtectedRoute, AdminRoute } from './components/auth'
import { OnboardingWizard } from './components/onboarding'
import { PageCarousel } from './components/navigation'
import { Dashboard, SpendListPage, SettingsPage, AdminPage } from './pages'
import { LoginPage, SignupPage, ResetPasswordPage } from './pages/auth'
import { PrivacyPolicyPage, TermsOfServicePage } from './pages/legal'
import { useAuthStore } from './stores/useAuthStore'
import { useOnboardingStore } from './stores/useOnboardingStore'
import { NotificationScheduler } from './services/notificationScheduler'
import { BrowserNotificationProvider } from './adapters/notifications/BrowserNotificationProvider'
import { SupabaseSpendRepository } from './adapters/db/SupabaseSpendRepository'
import { supabase } from './config/supabase'
import './App.css'

function App() {
  // Inicializar y escuchar cambios de tema (necesario para que se aplique)
  useTheme()
  
  const { toasts, removeToast, isSelectionModeActive } = useUIStore()
  const { settings } = useSettingsStore()
  const { isAuthenticated, user } = useAuthStore()
  const { completed: onboardingCompleted } = useOnboardingStore()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const schedulerRef = useRef<NotificationScheduler | null>(null)

  // Mostrar onboarding si usuario autenticado y no completó onboarding
  useEffect(() => {
    if (isAuthenticated && user && !onboardingCompleted) {
      setShowOnboarding(true)
    } else {
      setShowOnboarding(false)
    }
  }, [isAuthenticated, user, onboardingCompleted])

  // Inicializar NotificationScheduler
  useEffect(() => {
    if (settings && !schedulerRef.current) {
      const notifProvider = new BrowserNotificationProvider()
      const spendRepo = new SupabaseSpendRepository(supabase)
      schedulerRef.current = new NotificationScheduler(notifProvider, spendRepo)
      schedulerRef.current.start(settings)
      console.log('[App] NotificationScheduler initialized')
    }

    // Actualizar settings si cambian
    if (settings && schedulerRef.current) {
      schedulerRef.current.updateSettings(settings)
    }

    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.stop()
        schedulerRef.current = null
      }
    }
  }, [settings])

  return (
    <BrowserRouter>
      {/* Toast Container Global */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} position="top-right" />
      
      {/* Safari Banner - Aviso sobre indicador de micrófono */}
      <SafariBanner />

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}

      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/legal/terms" element={<TermsOfServicePage />} />

        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <PageCarousel>
                <Dashboard />
                <SpendListPage />
                <SettingsPage />
              </PageCarousel>
              {!isSelectionModeActive && <BottomNav />}
            </ProtectedRoute>
          }
        />

        {/* Ruta de administración */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
