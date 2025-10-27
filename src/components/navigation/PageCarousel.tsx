/**
 * PageCarousel
 * Carrusel verdadero para navegación con swipe
 * Las 3 páginas están montadas lado a lado, se ven ambas durante el drag
 */

import { motion, PanInfo } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const ROUTES = ['/', '/spends', '/settings'] as const
const SWIPE_THRESHOLD = 100 // Umbral en pixels para activar navegación (aumentado para menos sensibilidad)

interface PageCarouselProps {
  children: React.ReactNode[]
}

export function PageCarousel({ children }: PageCarouselProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentIndex = ROUTES.indexOf(location.pathname as typeof ROUTES[number])

  // Si la ruta no está en ROUTES, redirigir al dashboard
  useEffect(() => {
    if (currentIndex === -1) {
      navigate('/', { replace: true })
    }
  }, [currentIndex, navigate])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    console.log('🦊 Swipe:', { 
      offset, 
      velocity, 
      currentIndex, 
      currentRoute: ROUTES[currentIndex] 
    })

    // Swipe a la izquierda (siguiente ruta)
    if ((offset < -SWIPE_THRESHOLD || velocity < -500) && currentIndex < ROUTES.length - 1) {
      console.log('→ Navegando a:', ROUTES[currentIndex + 1])
      navigate(ROUTES[currentIndex + 1])
      return
    }

    // Swipe a la derecha (ruta anterior)
    if ((offset > SWIPE_THRESHOLD || velocity > 500) && currentIndex > 0) {
      console.log('← Navegando a:', ROUTES[currentIndex - 1])
      navigate(ROUTES[currentIndex - 1])
      return
    }

    console.log('⚠️ No se navegó - umbral no alcanzado')
  }

  // Elasticidad dinámica: sin rebote en los extremos
  const dragElastic = 
    currentIndex === 0 
      ? { left: 0, right: 0.1 } // Primera página: no rebote a la izquierda
      : currentIndex === ROUTES.length - 1 
      ? { left: 0.1, right: 0 } // Última página: no rebote a la derecha
      : 0.1 // Páginas intermedias: rebote en ambos lados

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Contenedor que se mueve horizontalmente */}
      <motion.div
        className="flex h-full"
        style={{ 
          width: `${ROUTES.length * 100}vw` // 3 páginas × 100vw = 300vw
        }}
        animate={{
          x: `-${currentIndex * 100}vw`, // Desplazamiento según índice actual
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={dragElastic}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        transition={{
          type: 'spring',
          stiffness: 200, // Reducido de 300 para movimiento más suave
          damping: 25,    // Reducido de 30 para menos fricción
          mass: 1,        // Añadido para más inercia natural
        }}
      >
        {/* Cada página ocupa 100vw y está una al lado de la otra */}
        {children.map((child, index) => (
          <div
            key={ROUTES[index]}
            className="h-full flex-shrink-0 overflow-y-auto"
            style={{ width: '100vw' }}
          >
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

