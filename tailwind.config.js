/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4EFEA',
          300: '#EFE8DE',
          400: '#E2D8CA',
          500: '#D5C7B3',
        },
        ink: {
          light: '#4A4641',
          DEFAULT: '#2D2A26',
          dark: '#1C1B1A',
        },
        paper: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4EFEA',
          300: '#EFE8DE',
          800: '#2D2A26',
          900: '#1C1B1A',
        },
        neo: {
          bg: '#FAF7F2',
          dark: '#2D2A26',
          yellow: '#E6B347',
          amber: '#D4882E',
          indigo: '#435479',
          emerald: '#3F6E55',
          rose: '#B85450',
          purple: '#6E5D7A',
          sky: '#4D7287',
        },
        editorial: {
          terracotta: '#C86D51',
          ochre: '#D4A359',
          sage: '#6B8E73',
          navy: '#384860',
          parchment: '#F6F1EB',
          bistre: '#242220',
          border: '#E5DDD2',
        },
      },
      boxShadow: {
        'soft-xs': '0 1px 2px rgba(45, 42, 38, 0.04)',
        'soft-sm': '0 2px 4px rgba(45, 42, 38, 0.05)',
        'soft': '0 3px 10px -1px rgba(45, 42, 38, 0.06), 0 1px 3px rgba(45, 42, 38, 0.04)',
        'soft-md': '0 6px 18px -2px rgba(45, 42, 38, 0.08), 0 2px 6px rgba(45, 42, 38, 0.04)',
        'soft-lg': '0 12px 28px -4px rgba(45, 42, 38, 0.1), 0 4px 10px rgba(45, 42, 38, 0.04)',
        'neo-xs': '0 1px 2px rgba(45, 42, 38, 0.05)',
        'neo-sm': '0 2px 4px rgba(45, 42, 38, 0.06)',
        'neo': '0 3px 10px -1px rgba(45, 42, 38, 0.07)',
        'neo-lg': '0 8px 20px -3px rgba(45, 42, 38, 0.09)',
        'neo-xl': '0 16px 32px -4px rgba(45, 42, 38, 0.12)',
        'neo-indigo': '0 4px 14px -2px rgba(67, 84, 121, 0.25)',
      },
    },
  },
  plugins: [],
};
