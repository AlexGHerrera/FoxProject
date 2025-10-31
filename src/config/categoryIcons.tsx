/**
 * Category Icons Configuration
 * Mapeo de categorías a iconos Lucide y esquemas de color
 */

import {
  Coffee,
  UtensilsCrossed,
  ShoppingCart,
  Car,
  Gamepad2,
  Home,
  Heart,
  ShoppingBag,
  Package,
  type LucideIcon
} from 'lucide-react'
import { Category } from '@/domain/models'

/**
 * Mapa de categorías a componentes de iconos Lucide
 */
export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  'Café': Coffee,
  'Comida fuera': UtensilsCrossed,
  'Supermercado': ShoppingCart,
  'Transporte': Car,
  'Ocio': Gamepad2,
  'Hogar': Home,
  'Salud': Heart,
  'Compras': ShoppingBag,
  'Otros': Package,
}

/**
 * Esquema de colores por categoría (light/dark mode)
 * Inspirado en los mockups: backgrounds sutiles con iconos en tonos más saturados
 */
export const CATEGORY_COLORS: Record<Category, { bg: string; icon: string }> = {
  'Café': { 
    bg: 'bg-amber-100 dark:bg-amber-900/30', 
    icon: 'text-amber-600 dark:text-amber-400' 
  },
  'Comida fuera': { 
    bg: 'bg-orange-100 dark:bg-orange-900/30', 
    icon: 'text-orange-600 dark:text-orange-400' 
  },
  'Supermercado': { 
    bg: 'bg-blue-100 dark:bg-blue-900/30', 
    icon: 'text-blue-600 dark:text-blue-400' 
  },
  'Transporte': { 
    bg: 'bg-cyan-100 dark:bg-cyan-900/30', 
    icon: 'text-cyan-600 dark:text-cyan-400' 
  },
  'Ocio': { 
    bg: 'bg-purple-100 dark:bg-purple-900/30', 
    icon: 'text-purple-600 dark:text-purple-400' 
  },
  'Hogar': { 
    bg: 'bg-green-100 dark:bg-green-900/30', 
    icon: 'text-green-600 dark:text-green-400' 
  },
  'Salud': { 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    icon: 'text-red-600 dark:text-red-400' 
  },
  'Compras': { 
    bg: 'bg-pink-100 dark:bg-pink-900/30', 
    icon: 'text-pink-600 dark:text-pink-400' 
  },
  'Otros': { 
    bg: 'bg-gray-100 dark:bg-gray-900/30', 
    icon: 'text-gray-600 dark:text-gray-400' 
  },
}

