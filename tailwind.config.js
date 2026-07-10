/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8ecf4',
          100: '#c5cee3',
          200: '#9eadd0',
          300: '#778cbd',
          400: '#5973af',
          500: '#3b5aa1',
          600: '#354f93',
          700: '#2d4182',
          800: '#253472',
          900: '#171f53',
        },
        petrol: {
          50: '#e6f3f1',
          100: '#c0e0db',
          200: '#96ccc3',
          300: '#6cb8ab',
          400: '#4da899',
          500: '#2e9887',
          600: '#298879',
          700: '#237569',
          800: '#1d6359',
          900: '#11433d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
