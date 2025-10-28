/**
 * Hook para navegación con swipe entre rutas
 * Usa framer-motion para detección de gestos
 */

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PanInfo } from 'framer-motion'

const ROUTES = ['/', '/spends', '/settings'] as const
const SWIPE_THRESHOLD = 100 // Mínimo de pixels para activar navegación

export function useSwipeNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [direction, setDirection] = useState(0) // -1: izq, 1: der, 0: inicial

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

    // Swipe a la izquierda (siguiente ruta) → nueva página entra desde la derecha
    if ((offset < -SWIPE_THRESHOLD || velocity < -500) && currentIndex < ROUTES.length - 1) {
      setDirection(1) // Nueva página viene de la derecha
      navigate(ROUTES[currentIndex + 1])
      return
    }

    // Swipe a la derecha (ruta anterior) → nueva página entra desde la izquierda
    if ((offset > SWIPE_THRESHOLD || velocity > 500) && currentIndex > 0) {
      setDirection(-1) // Nueva página viene de la izquierda
      navigate(ROUTES[currentIndex - 1])
      return
    }
  }

  return {
    onDragEnd: handleDragEnd,
    currentIndex,
    totalRoutes: ROUTES.length,
    direction, // Ahora es dinámico
  }
}

