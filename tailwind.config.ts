import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        wiggle: 'wiggle 0.5s ease-in-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1deg)' },
          '75%': { transform: 'rotate(1deg)' },
        },
        bounceIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px) scale(0.95)',
          },
          '50%': { 
            opacity: '1',
            transform: 'translateY(5px) scale(1.02)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },
      fontFamily: {
        'cursor-gothic-bold': ['Cursor Gothic Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config



