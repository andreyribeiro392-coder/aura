/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00ffcc',
        'neon-blue': '#0080ff',
        'neon-purple': '#a855f7',
      },
    },
  },
  plugins: [],
}
