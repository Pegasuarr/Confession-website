/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FF4D8D',
          pinkHover: '#E03B75',
          purple: '#9D4EDD',
          purpleDark: '#5A189A',
        },
        dark: {
          bg: '#0F0C1B',
          card: '#18142C',
          border: '#2C254B',
          text: '#F3F0FF',
        }
      },
      borderRadius: {
        'card': '20px',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(255, 77, 141, 0.15)',
        'premium-purple': '0 10px 30px -10px rgba(157, 78, 221, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
