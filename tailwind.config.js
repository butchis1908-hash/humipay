/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        humi: {
          base: '#ffb703',
          warm: '#fb8500',
          deep: '#ff7b00'
        }
      }
    }
  },
  plugins: []
}
