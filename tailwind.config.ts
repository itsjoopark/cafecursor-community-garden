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
      },
      fontFamily: {
        'cursor-gothic-bold': ['Cursor Gothic Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config



