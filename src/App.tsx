import { BrowserRouter } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { useUIStore } from './stores/useUIStore'
import { ToastContainer, SafariBanner, BottomNav } from './components/ui'
import { PageCarousel } from './components/navigation'
import { Dashboard, SpendListPage, SettingsPage } from './pages'
import './App.css'

function App() {
  // Inicializar y escuchar cambios de tema (necesario para que se aplique)
  useTheme()
  
  const { toasts, removeToast, isSelectionModeActive } = useUIStore()

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
