/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sistema semántico unificado usando CSS variables
        background: {
          DEFAULT: 'var(--bg)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
        },
        card: {
          DEFAULT: 'var(--card)',
        },
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--muted)',
        },
        border: {
          DEFAULT: 'var(--divider)',
        },
        divider: {
          DEFAULT: 'var(--divider)',
        },
        'chip-bg': {
          DEFAULT: 'var(--chip-bg)',
        },
        
        // Colores de marca usando CSS variables
        'brand-cyan': {
          DEFAULT: 'var(--brand-cyan)',
          dark: '#00D3FF',
        },
        'brand-cyan-neon': {
          DEFAULT: 'var(--brand-cyan-neon)',
          dark: '#35FFFF',
        },
        'brand-orange': {
          DEFAULT: 'var(--brand-orange)',
          dark: '#FFB84C',
        },
        success: {
          DEFAULT: 'var(--success)',
          dark: '#34D399',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          dark: '#F59E0B',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          dark: '#F87171',
        },
        
        // Sistema legacy (mantener para compatibilidad durante migración)
        'bg-light': '#F9FAFB',
        'surface-light': '#FFFFFF',
        'text-light': '#111827',
        'muted-light': '#6B7280',
        'divider-light': '#E5E7EB',
        'card-light': '#FFFFFF',
        'chip-bg-light': '#EEF2FF',
        'bg-dark': '#0F111A',
        'surface-dark': '#12141F',
        'text-dark': '#F3F4F6',
        'muted-dark': '#94A3B8',
        'divider-dark': '#1F2430',
        'card-dark': '#141826',
        'chip-bg-dark': '#1B2030',
      },
      borderRadius: {
        'xs': '6px',
        'sm': '10px',
        'md': '14px',
        'lg': '20px',
        'xl': '28px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.06)',
        'md': '0 6px 24px rgba(0,0,0,0.08)',
        'xl': '0 20px 60px rgba(0,0,0,0.12)',
        'mic': '0 10px 30px rgba(0, 200, 255, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '36px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(0, 229, 255, 0.7)',
          },
          '70%': {
            boxShadow: '0 0 0 30px rgba(0, 229, 255, 0)',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(0, 229, 255, 0)',
          },
        },
      },
    },
  },
  plugins: [
    // Los utilities base están definidos en src/index.css usando @layer components
  ],
}
