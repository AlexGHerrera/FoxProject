import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { useUIStore } from './stores/useUIStore'
import { ToastContainer } from './components/ui'
import { Dashboard } from './pages'
import './App.css'

function App() {
  const { theme } = useTheme()
  const { toasts, removeToast } = useUIStore()

  return (
    <BrowserRouter>
      {/* Toast Container Global */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} position="top-right" />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* TODO: Agregar más rutas cuando se implementen */}
        {/* <Route path="/spends" element={<SpendsPage />} /> */}
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
        {/* <Route path="/onboarding" element={<OnboardingPage />} /> */}
        
        {/* Redirect desconocidos a dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
