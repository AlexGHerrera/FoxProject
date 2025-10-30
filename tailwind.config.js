/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sistema legacy (mantener para compatibilidad)
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
        
        // Colores de marca
        'brand-cyan': {
          DEFAULT: '#00B8D9',
          dark: '#00D3FF',
        },
        'brand-cyan-neon': {
          DEFAULT: '#00E5FF',
          dark: '#35FFFF',
        },
        'brand-orange': {
          DEFAULT: '#FF9D00',
          dark: '#FFB84C',
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#34D399',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#F59E0B',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#F87171',
        },
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
    function({ addUtilities, theme }) {
      addUtilities({
        '.bg-background': {
          backgroundColor: '#F9FAFB',
          '.dark &': {
            backgroundColor: '#0F111A',
          },
        },
        '.bg-surface': {
          backgroundColor: '#FFFFFF',
          '.dark &': {
            backgroundColor: '#12141F',
          },
        },
        '.bg-card': {
          backgroundColor: '#FFFFFF',
          '.dark &': {
            backgroundColor: '#141826',
          },
        },
        '.text-text': {
          color: '#111827',
          '.dark &': {
            color: '#F3F4F6',
          },
        },
        '.text-muted': {
          color: '#6B7280',
          '.dark &': {
            color: '#94A3B8',
          },
        },
        '.border-border': {
          borderColor: '#E5E7EB',
          '.dark &': {
            borderColor: '#1F2430',
          },
        },
      })
    },
  ],
}
