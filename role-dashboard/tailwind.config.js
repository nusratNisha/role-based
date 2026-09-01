/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        role: {
          admin: '#dc2626',
          manager: '#d97706',
          editor: '#0891b2',
          viewer: '#6b7280',
        }
      }
    },
  },
  plugins: [],
}
