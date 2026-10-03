/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8f1',
          100: '#f5eedd',
          200: '#ebdcba',
          300: '#dec491',
          400: '#cca563',
          500: '#b88b42',
          600: '#9e7135',
          700: '#7f552c',
          800: '#684529',
          900: '#563a25',
        },
        ivory: '#faf8f5',
        charcoal: '#1a1918',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
