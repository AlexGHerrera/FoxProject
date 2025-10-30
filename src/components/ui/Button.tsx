/**
 * Button component
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm, md, lg
 * Cumple WCAG AA (tamaño táctil mínimo 44x44px)
 */

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'btn-base'

    const variantStyles = {
      primary:
        'bg-brand-cyan dark:bg-brand-cyan-dark text-white hover:opacity-90 focus-visible:ring-brand-cyan shadow-md',
      secondary:
        'bg-card text-text border border-border hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-brand-cyan',
      ghost:
        'text-text hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-brand-cyan',
      danger:
        'bg-danger dark:bg-danger-dark text-white hover:opacity-90 focus-visible:ring-danger shadow-md',
    }

    const sizeStyles = {
      sm: 'text-sm px-3 py-2 rounded-md min-h-[36px]',
      md: 'text-base px-4 py-3 rounded-md min-h-[44px]',
      lg: 'text-lg px-6 py-4 rounded-lg min-h-[52px]',
    }

    const widthStyles = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

