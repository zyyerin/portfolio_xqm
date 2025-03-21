/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      columnSpan: {
        'full': 'all',
        '2': '2',
      },
    },
  },
  plugins: [],
};
