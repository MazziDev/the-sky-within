/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#050A1A',
        lunar: '#D6D8FF',
        stardust: '#9B8CFF',
        nebula: '#1B2540',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
      boxShadow: {
        lunar: '0 0 30px rgba(155, 140, 255, 0.45)',
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(circle at 20% 20%, rgba(155, 140, 255, 0.3), transparent 55%), radial-gradient(circle at 80% 0%, rgba(75, 173, 255, 0.2), transparent 60%)',
      },
    },
  },
  plugins: [],
}

