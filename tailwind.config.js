/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220 20% 12%)',
        text: 'hsl(220 10% 92%)',
        muted: 'hsl(220 10% 60%)',
        accent: 'hsl(170 70% 45%)',
        primary: 'hsl(230 70% 50%)',
        surface: 'hsl(220 20% 16%)',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0, 0%, 0%, 0.1)',
        'modal': '0 12px 32px hsla(0, 0%, 0%, 0.2)',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
      },
    },
  },
  plugins: [],
}