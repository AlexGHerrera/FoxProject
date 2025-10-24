/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // auto detect based on prefers-color-scheme
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'bg-light': '#F9FAFB',
        'surface-light': '#FFFFFF',
        'text-light': '#111827',
        'muted-light': '#6B7280',
        'brand-cyan': '#00B8D9',
        'brand-cyan-neon': '#00E5FF',
        'brand-orange': '#FF9D00',
        'success-light': '#10B981',
        'warning': '#F59E0B',
        'danger-light': '#EF4444',
        'divider-light': '#E5E7EB',
        'card-light': '#FFFFFF',
        'chip-bg-light': '#EEF2FF',
        
        // Dark mode colors
        'bg-dark': '#0F111A',
        'surface-dark': '#12141F',
        'text-dark': '#F3F4F6',
        'muted-dark': '#94A3B8',
        'brand-cyan-dark': '#00D3FF',
        'brand-cyan-neon-dark': '#35FFFF',
        'brand-orange-dark': '#FFB84C',
        'success-dark': '#34D399',
        'danger-dark': '#F87171',
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
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'md': '16px',
        'lg': '20px',
        'xl': '28px',
        'xxl': '36px',
      },
      fontWeight: {
        'regular': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
      },
    },
  },
  plugins: [],
}

