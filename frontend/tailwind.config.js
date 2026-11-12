/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hatly: {
          red: '#E70209',
          redHover: '#CC0006',
          redDark: '#990004',
          redLight: '#FEF2F2',
          redBorder: '#FEE2E2',
          navy: '#1B1464',
          navyHover: '#140E4B',
          navyLight: '#EEF2FF',
          dark: '#0F172A',
          darkCard: '#1E293B',
          darkMuted: '#334155',
          grayBg: '#F8FAFC',
          grayBorder: '#E2E8F0',
          grayText: '#64748B',
          green: '#10B981',
          greenLight: '#ECFDF5',
          // Mapped for backwards-compatibility
          orange: '#E70209',
          orangeHover: '#CC0006',
          orangeLight: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
