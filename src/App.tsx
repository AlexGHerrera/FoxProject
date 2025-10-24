import { useState, useEffect } from 'react'
import { supabase } from './config/supabase'
import { useTheme } from './hooks/useTheme'
import { useUIStore } from './stores/useUIStore'
import { Button, ToastContainer } from './components/ui'
import { VoiceRecorder } from './components/voice'
import './App.css'

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string>('')
  const [showVoiceDemo, setShowVoiceDemo] = useState(false)
  
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { toasts, removeToast, showSuccess, showError, showInfo, showWarning } = useUIStore()

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { error: queryError } = await supabase
          .from('spends')
          .select('count')
          .limit(1)

        if (queryError) {
          if (queryError.code === 'PGRST301' || queryError.message.includes('JWT')) {
            setConnectionStatus('connected')
            setError('Conexión exitosa (sin autenticación aún)')
          } else {
            setConnectionStatus('error')
            setError(`Error: ${queryError.message}`)
          }
        } else {
          setConnectionStatus('connected')
          setError('Conexión exitosa')
        }
      } catch (err) {
        setConnectionStatus('error')
        setError(err instanceof Error ? err.message : 'Error desconocido')
      }
    }

    testConnection()
  }, [])

  const testToasts = () => {
    showSuccess('Gasto guardado correctamente')
    setTimeout(() => showInfo('Esta es una notificación informativa'), 500)
    setTimeout(() => showWarning('Estás cerca del límite mensual'), 1000)
    setTimeout(() => showError('Error al procesar el gasto'), 1500)
  }

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} position="top-right" />

      {showVoiceDemo ? (
        // Voice Demo Mode
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-200 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">
                🦊 Foxy Voice Demo
              </h1>
              <Button variant="ghost" onClick={() => setShowVoiceDemo(false)}>
                ← Volver
              </Button>
            </div>
            <VoiceRecorder />
          </div>
        </div>
      ) : (
        // Setup/Status Mode
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-200 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-surface-light dark:bg-surface-dark rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-brand-cyan to-blue-500 bg-clip-text text-transparent">
                🦊 Foxy
              </span>
            </h1>
            <p className="text-muted-light dark:text-muted-dark">
              Finanzas por Voz - MVP Setup
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-chip-bg-light dark:bg-chip-bg-dark rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">
              Estado de Conexión
            </h2>
            
            <div className="space-y-3">
              {/* Supabase Status */}
              <div className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-md">
                <span className="font-medium text-text-light dark:text-text-dark">
                  Supabase
                </span>
                {connectionStatus === 'checking' && (
                  <span className="text-warning flex items-center gap-2">
                    <span className="animate-pulse">⏳</span> Verificando...
                  </span>
                )}
                {connectionStatus === 'connected' && (
                  <span className="text-success flex items-center gap-2">
                    ✅ Conectado
                  </span>
                )}
                {connectionStatus === 'error' && (
                  <span className="text-danger flex items-center gap-2">
                    ❌ Error
                  </span>
                )}
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-md">
                <span className="font-medium text-text-light dark:text-text-dark">
                  Tema actual
                </span>
                <span className="text-brand-cyan dark:text-brand-cyan-dark">
                  {resolvedTheme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
                </span>
              </div>

              {/* Environment */}
              <div className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-md">
                <span className="font-medium text-text-light dark:text-text-dark">
                  Entorno
                </span>
                <span className="text-brand-cyan dark:text-brand-cyan-dark">
                  {import.meta.env.VITE_APP_ENV || 'dev'}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mt-4 p-3 rounded-md ${
                connectionStatus === 'connected' 
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              }`}>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-text-light dark:text-text-dark">
              🧪 Probar Componentes:
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => setShowVoiceDemo(true)}>
                🎤 Probar Voz
              </Button>
              <Button variant="secondary" onClick={testToasts}>
                Probar Toasts
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {resolvedTheme === 'dark' ? '☀️' : '🌙'}
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-light dark:text-text-dark">
              📋 Próximos Pasos:
            </h3>
            <ol className="space-y-2 text-sm text-muted-light dark:text-muted-dark">
              <li className="flex items-start gap-2">
                <span className="text-success">✅</span>
                <span>Proyecto creado y configurado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✅</span>
                <span>Dependencias instaladas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✅</span>
                <span>Supabase configurado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={connectionStatus === 'connected' ? 'text-success' : 'text-warning'}>
                  {connectionStatus === 'connected' ? '✅' : '⏳'}
                </span>
                <span>Conexión verificada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✅</span>
                <span>Componentes UI base implementados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✅</span>
                <span>Stores y hooks implementados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✅</span>
                <span>Flujo de voz completo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning">⏳</span>
                <span>Dashboard y componentes Foxy</span>
              </li>
            </ol>
          </div>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-divider-light dark:border-divider-dark text-center text-sm text-muted-light dark:text-muted-dark">
            <p>Arquitectura Hexagonal • TypeScript • Tailwind CSS</p>
            <p className="mt-1">Alex G. Herrera • 2025</p>
          </div>
        </div>
      </div>
      )}
    </>
  )
}

export default App
