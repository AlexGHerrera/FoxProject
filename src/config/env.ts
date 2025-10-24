/**
 * Environment variables configuration
 * Validación y tipado de variables de entorno
 */

interface EnvConfig {
  appEnv: 'dev' | 'staging' | 'production'
  appUrl: string
  supabase: {
    url: string
    anonKey: string
  }
  deepseek?: {
    apiKey: string
  }
  analytics?: {
    id: string
  }
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function getOptionalEnvVar(key: string): string | undefined {
  return import.meta.env[key]
}

export const env: EnvConfig = {
  appEnv: (import.meta.env.VITE_APP_ENV as EnvConfig['appEnv']) || 'dev',
  appUrl: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
  deepseek: {
    apiKey: getOptionalEnvVar('VITE_DEEPSEEK_API_KEY') || '',
  },
  analytics: {
    id: getOptionalEnvVar('VITE_ANALYTICS_ID') || '',
  },
}

// Validación básica en dev
if (env.appEnv === 'dev') {
  console.log('[env] Configuration loaded:', {
    appEnv: env.appEnv,
    appUrl: env.appUrl,
    supabaseUrl: env.supabase.url.substring(0, 20) + '...',
  })
}

