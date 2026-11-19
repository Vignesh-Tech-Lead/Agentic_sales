/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1220',
        canvas: '#fafafa',
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bed0ff',
          300: '#96b0ff',
          400: '#6b89f9',
          500: '#4466f5',
          600: '#3151dd',
          700: '#2741b4',
          800: '#1f358f',
          900: '#1b2d70',
        },
        teal: {
          500: '#0d9f8f',
          600: '#0b8578',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.05)',
        pop: '0 20px 60px rgba(15,23,42,.18)',
      },
    },
  },
  plugins: [],
};
