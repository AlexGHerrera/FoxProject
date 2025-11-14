import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useUIStore } from './stores/useUIStore'
import { ToastContainer, SafariBanner, BottomNav } from './components/ui'
import { ProtectedRoute, AdminRoute } from './components/auth'
import { PageCarousel } from './components/navigation'
import { Dashboard, SpendListPage, SettingsPage, AdminPage } from './pages'
import { LoginPage, SignupPage, ResetPasswordPage } from './pages/auth'
import { PrivacyPolicyPage, TermsOfServicePage } from './pages/legal'
import { NotificationScheduler } from './services/notificationScheduler'
import { BrowserNotificationProvider } from './adapters/notifications/BrowserNotificationProvider'
import { SupabaseSpendRepository } from './adapters/db/SupabaseSpendRepository'
import { supabase } from './config/supabase'
import './App.css'

function AppContent() {
  useTheme()
  useAuth() // Inicializar autenticación
  
  const { toasts, removeToast, isSelectionModeActive } = useUIStore()
  const schedulerRef = useRef<NotificationScheduler | null>(null)

  // Inicializar NotificationScheduler
  useEffect(() => {
    const notifProvider = new BrowserNotificationProvider()
    const spendRepo = new SupabaseSpendRepository(supabase)
    schedulerRef.current = new NotificationScheduler(notifProvider, spendRepo)
    
    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.stop()
      }
    }
  }, [])

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={removeToast} position="top-right" />
      <SafariBanner />

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
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

