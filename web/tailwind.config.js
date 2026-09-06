/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          maroon: '#7B1113',
          crimson: '#991b1b',
          dark: '#580c0d',
          gold: '#f59e0b',
          parchment: '#f8fafc',
        },
        signal: {
          green: '#22c55e',
          'green-glow': '#4ade80',
          'green-dark': '#14532d',
          amber: '#eab308',
          'amber-glow': '#facc15',
          'amber-dark': '#713f12',
          red: '#ef4444',
          'red-glow': '#f87171',
          'red-dark': '#7f1d1d',
        },
        retro: {
          bg: '#090d16',
          panel: '#111827',
          card: '#1a2234',
          border: '#334155',
          cyan: '#06b6d4',
          text: '#f1f5f9',
          muted: '#94a3b8',
        },
      },
      boxShadow: {
        'pixel': '3px 3px 0px 0px #000000',
        'pixel-sm': '2px 2px 0px 0px #000000',
        'pixel-lg': '5px 5px 0px 0px #000000',
        'pixel-cyan': '3px 3px 0px 0px #06b6d4',
        'pixel-maroon': '3px 3px 0px 0px #7B1113',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        digital: ['"VT323"', 'monospace'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
};
