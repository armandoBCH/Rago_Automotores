/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'rago-black': '#0D0D0D',
        'rago-burgundy': '#6C1E27',
        'rago-burgundy-darker': '#50161D',
        'rago-white': '#FFFFFF',
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      boxShadow: {
        'subtle': '0 4px 14px 0 rgba(0, 0, 0, 0.03)',
        'subtle-hover': '0 6px 20px 0 rgba(0, 0, 0, 0.05)',
        'subtle-dark': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 20px 0 rgba(108, 30, 39, 0.07)',
        'subtle-hover-dark': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 6px 20px 0 rgba(108, 30, 39, 0.07)',
        'rago-md': '0 5px 15px -3px rgba(108, 30, 39, 0.15), 0 3px 6px -4px rgba(108, 30, 39, 0.15)',
        'rago-lg': '0 10px 25px -5px rgba(108, 30, 39, 0.25), 0 8px 10px -6px rgba(108, 30, 39, 0.22)',
        'rago-glow': '0 0 30px -5px rgba(108, 30, 39, 0.3)',
      },
    }
  },
  plugins: [],
}
