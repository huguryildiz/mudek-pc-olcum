import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B3A8C',
          foreground: '#FFFFFF',
          50:  '#EEF1FB',
          100: '#D5DCF5',
          200: '#ABB8EB',
          300: '#8095E1',
          400: '#5671D7',
          500: '#2B3A8C',
          600: '#1F2B67',
          700: '#141C44',
          800: '#0A0E22',
          900: '#050711',
        },
        canvas: '#F5F7FA',
        ink:   '#161B26',
        border: '#E3E7ED',
        surface: '#FFFFFF',
        muted: {
          DEFAULT: '#F1F4F8',
          foreground: '#64748B',
        },
        attainment: {
          below:  '#B4490F',
          border: '#B8860B',
          above:  '#0F766E',
          'below-bg':  '#FEF3EE',
          'border-bg': '#FEFCE8',
          'above-bg':  '#F0FDF4',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(22,27,38,0.07), 0 1px 2px -1px rgba(22,27,38,0.05)',
        'card-hover': '0 4px 12px 0 rgba(22,27,38,0.10)',
      },
    },
  },
  plugins: [],
}

export default config
