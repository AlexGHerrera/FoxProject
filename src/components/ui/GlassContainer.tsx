/**
 * GlassContainer Component
 * Componente reutilizable para efectos glassmorphism
 */

import { cn } from '@/utils/cn';

type GlassVariant = 'subtle' | 'medium' | 'strong';

export interface GlassContainerProps {
  children: React.ReactNode;
  variant?: GlassVariant;
  borderGradient?: boolean;
  className?: string;
}

const variantStyles: Record<GlassVariant, string> = {
  subtle: 'bg-surface/40 backdrop-blur-sm',
  medium: 'bg-surface/60 backdrop-blur-md',
  strong: 'bg-surface/80 backdrop-blur-xl',
};

export function GlassContainer({
  children,
  variant = 'medium',
  borderGradient = false,
  className,
}: GlassContainerProps) {
  return (
    <div
      className={cn(
        variantStyles[variant],
        'rounded-xl relative',
        borderGradient
          ? 'border border-transparent'
          : 'border border-border/50',
        className
      )}
    >
      {borderGradient && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-cyan/20 via-brand-cyan-neon/15 to-transparent opacity-60 -z-10 blur-sm" />
      )}
      {children}
    </div>
  );
}

