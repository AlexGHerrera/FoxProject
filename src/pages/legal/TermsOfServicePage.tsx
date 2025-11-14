/**
 * TermsOfServicePage Component
 * Página de Términos de Servicio
 */

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-text">Términos de Servicio</h1>
          <p className="text-sm text-muted">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">1. Aceptación de los Términos</h2>
            <p className="text-text">
              Al acceder y usar Foxy, aceptas estos términos de servicio. Si no estás de acuerdo, no uses el servicio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">2. Uso del Servicio</h2>
            <p className="text-text">
              Te comprometes a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text ml-4">
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la seguridad de tu cuenta</li>
              <li>No usar el servicio para actividades ilegales</li>
              <li>No intentar acceder a cuentas de otros usuarios</li>
              <li>No interferir con el funcionamiento del servicio</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">3. Responsabilidades</h2>
            <p className="text-text">
              <strong>Tu responsabilidad:</strong> Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades que ocurran bajo tu cuenta.
            </p>
            <p className="text-text">
              <strong>Nuestra responsabilidad:</strong> Nos esforzamos por proporcionar un servicio confiable y seguro, pero no garantizamos disponibilidad ininterrumpida o libre de errores.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">4. Limitación de Garantías</h2>
            <p className="text-text">
              El servicio se proporciona "tal cual" y "según disponibilidad". No garantizamos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text ml-4">
              <li>Precisión absoluta en el procesamiento de voz</li>
              <li>Disponibilidad continua del servicio</li>
              <li>Ausencia de errores o interrupciones</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">5. Limitación de Responsabilidad</h2>
            <p className="text-text">
              En ningún caso seremos responsables de daños indirectos, incidentales o consecuentes derivados del uso del servicio, incluyendo pérdidas financieras o decisiones tomadas basándose en la información proporcionada.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">6. Modificaciones del Servicio</h2>
            <p className="text-text">
              Nos reservamos el derecho de modificar, suspender o discontinuar el servicio en cualquier momento, con o sin previo aviso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">7. Terminación</h2>
            <p className="text-text">
              Puedes cancelar tu cuenta en cualquier momento desde Ajustes. Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">8. Cambios en los Términos</h2>
            <p className="text-text">
              Podemos modificar estos términos en cualquier momento. Los cambios entrarán en vigor al publicarlos. El uso continuado del servicio después de los cambios constituye aceptación.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">9. Ley Aplicable</h2>
            <p className="text-text">
              Estos términos se rigen por las leyes de España. Cualquier disputa se resolverá en los tribunales competentes de España.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text">10. Contacto</h2>
            <p className="text-text">
              Si tienes preguntas sobre estos términos, puedes contactarnos a través de la sección de Feedback en Ajustes.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

