// TaskForge_AI/frontend/tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ['var(--font-lato)'],
      },
      colors: {
        'background': '#121212',
        'surface': '#1E1E1E',
        'primary': '#BB86FC',
        'secondary': '#03DAC6',
        'on-background': '#FFFFFF',
        'on-surface': '#FFFFFF',
        'on-primary': '#000000',
        'on-secondary': '#000000',
        'error': '#CF6679',
      },
    },
  },
  // Add the forms plugin here
  plugins: [require('@tailwindcss/forms')],
}
export default config