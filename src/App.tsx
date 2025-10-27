import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useTheme } from './hooks/useTheme'
import { useUIStore } from './stores/useUIStore'
import { ToastContainer, SafariBanner } from './components/ui'
import { Dashboard, SpendListPage, SettingsPage } from './pages'
import './App.css'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/spends" element={<SpendListPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* TODO: Agregar más rutas cuando se implementen */}
        {/* <Route path="/onboarding" element={<OnboardingPage />} /> */}
        
        {/* Redirect desconocidos a dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const { theme } = useTheme()
  const { toasts, removeToast } = useUIStore()

  return (
    <BrowserRouter>
      {/* Toast Container Global */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} position="top-right" />
      
      {/* Safari Banner - Aviso sobre indicador de micrófono */}
      <SafariBanner />

      {/* Animated Routes */}
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
