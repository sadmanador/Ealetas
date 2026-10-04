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
        ocean: {
          50: '#f0f6fd',
          100: '#e0edfb',
          200: '#c5def7',
          300: '#9ec6f1',
          400: '#6ba4e8',
          500: '#3b82f6',
          600: '#1d5ec9',
          700: '#1548a8',
          800: '#0f388a',
          900: '#0a2561',
          950: '#06173d',
        },
        sapphire: {
          light: '#2563eb',
          DEFAULT: '#0f388a',
          dark: '#0a2561',
          deep: '#07183d',
        },
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
        pearl: '#f8fbfe',
        sand: '#faf7f2',
        charcoal: '#0d2342',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        script: ['Alex Brush', 'cursive'],
      },
    },
  },
  plugins: [],
};
