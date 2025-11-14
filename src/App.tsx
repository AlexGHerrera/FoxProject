import { BrowserRouter } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useTheme } from './hooks/useTheme'
import { useUIStore } from './stores/useUIStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { ToastContainer, SafariBanner, BottomNav } from './components/ui'
import { PageCarousel } from './components/navigation'
import { Dashboard, SpendListPage, SettingsPage } from './pages'
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
  const schedulerRef = useRef<NotificationScheduler | null>(null)

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

      {/* Carrusel con las 3 páginas principales siempre montadas */}
      <PageCarousel>
        <Dashboard />
        <SpendListPage />
        <SettingsPage />
      </PageCarousel>

      {/* Bottom Navigation - Oculto cuando hay modo selección activo */}
      {!isSelectionModeActive && <BottomNav />}
    </BrowserRouter>
  )
}

export default App
