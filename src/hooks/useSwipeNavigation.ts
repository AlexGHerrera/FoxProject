/**
 * Hook para navegación con swipe entre rutas
 * Usa framer-motion para detección de gestos
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { PanInfo } from 'framer-motion'

const ROUTES = ['/', '/spends', '/settings'] as const
const SWIPE_THRESHOLD = 100 // Mínimo de pixels para activar navegación

export function useSwipeNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentIndex = ROUTES.indexOf(location.pathname as typeof ROUTES[number])
  
  // Si estamos en una ruta no listada, no hacemos nada
  if (currentIndex === -1) {
    return {
      onDragEnd: () => {},
      currentIndex: 0,
      totalRoutes: ROUTES.length,
      direction: 0,
    }
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    // Swipe a la izquierda (siguiente ruta)
    if ((offset < -SWIPE_THRESHOLD || velocity < -500) && currentIndex < ROUTES.length - 1) {
      navigate(ROUTES[currentIndex + 1])
      return
    }

    // Swipe a la derecha (ruta anterior)
    if ((offset > SWIPE_THRESHOLD || velocity > 500) && currentIndex > 0) {
      navigate(ROUTES[currentIndex - 1])
      return
    }
  }

  return {
    onDragEnd: handleDragEnd,
    currentIndex,
    totalRoutes: ROUTES.length,
    direction: 0, // Se usará para animaciones
  }
}

