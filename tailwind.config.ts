import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./content/**/*.{md,mdx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
