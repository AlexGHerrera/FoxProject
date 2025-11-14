/**
 * PrivacyPolicyPage Component
 * Página de Política de Privacidad
 */

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/settings">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Ajustes
          </Button>
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-text">Política de Privacidad</h1>
          <p className="text-sm text-muted">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">1. Información que Recopilamos</h2>
            <p className="text-text">
              Recopilamos la siguiente información cuando usas Foxy:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text ml-4">
              <li><strong>Información de cuenta:</strong> Email y contraseña (encriptada)</li>
              <li><strong>Datos de gastos:</strong> Montos, categorías, establecimientos, fechas y métodos de pago</li>
              <li><strong>Configuración:</strong> Presupuesto mensual, preferencias de notificaciones</li>
              <li><strong>Uso de IA:</strong> Transcripciones de voz procesadas para extraer información de gastos</li>
              <li><strong>Feedback:</strong> Mensajes, sugerencias y reportes de bugs que envíes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">2. Cómo Usamos tu Información</h2>
            <p className="text-text">
              Utilizamos tu información para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text ml-4">
              <li>Procesar y almacenar tus gastos</li>
              <li>Proporcionar análisis y resúmenes de tus finanzas</li>
              <li>Enviar notificaciones y recordatorios personalizados</li>
              <li>Mejorar nuestros servicios mediante análisis de uso</li>
              <li>Responder a tus preguntas y feedback</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">3. Protección de Datos</h2>
            <p className="text-text">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text ml-4">
              <li>Encriptación de datos en tránsito y en reposo</li>
              <li>Autenticación segura mediante Supabase Auth</li>
              <li>Row Level Security (RLS) para acceso restringido a datos</li>
              <li>Almacenamiento en servidores seguros de Supabase</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">4. Tus Derechos (GDPR)</h2>
            <p className="text-text">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text ml-4">
              <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de tus datos</li>
              <li><strong>Portabilidad:</strong> Exportar tus datos en formato estándar</li>
              <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
            </ul>
            <p className="text-text">
              Para ejercer estos derechos, contacta a través de la sección de Feedback en Ajustes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">5. Compartir Información</h2>
            <p className="text-text">
              No vendemos ni compartimos tu información personal con terceros, excepto:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text ml-4">
              <li>Proveedores de servicios necesarios (Supabase para almacenamiento, DeepSeek para procesamiento de IA)</li>
              <li>Cuando sea requerido por ley o para proteger nuestros derechos</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">6. Retención de Datos</h2>
            <p className="text-text">
              Conservamos tus datos mientras tu cuenta esté activa. Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde Ajustes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">7. Contacto</h2>
            <p className="text-text">
              Si tienes preguntas sobre esta política, puedes contactarnos a través de la sección de Feedback en Ajustes.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

