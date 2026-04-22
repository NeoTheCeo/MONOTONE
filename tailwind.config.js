/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#141414',
        'surface-hover': '#1F1F1F',
        primary: '#D4AF37',
        'primary-hover': '#E5C158',
        accent: '#8B4513',
        'text': '#FAFAFA',
        'text-muted': '#A0A0A0',
        border: '#2A2A2A',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
}