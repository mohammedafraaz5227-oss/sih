/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060a12',
          900: '#0a101d',
          850: '#0f172a',
          800: '#131f38',
          750: '#192642',
          700: '#1e293b',
          600: '#334155',
        },
        railway: {
          maroon: '#7B1113',
          crimson: '#8B0000',
          red: '#dc2626',
          brightRed: '#ef4444',
          gold: '#f59e0b',
          yellow: '#ffb703',
        },
        electric: {
          cyan: '#00f0ff',
          sky: '#38bdf8',
          blue: '#0284c7',
        },
        signal: {
          green: '#00ff66',
          emerald: '#10b981',
          amber: '#ffb703',
          yellow: '#facc15',
          red: '#ff2a2a',
          danger: '#ef4444',
        },
        cyber: {
          purple: '#a855f7',
          violet: '#7c3aed',
          indigo: '#6366f1',
        },
      },
      boxShadow: {
        'pixel': '3px 3px 0px 0px #000000',
        'pixel-sm': '2px 2px 0px 0px #000000',
        'pixel-lg': '5px 5px 0px 0px #000000',
        'pixel-cyan': '3px 3px 0px 0px #00f0ff',
        'pixel-green': '3px 3px 0px 0px #00ff66',
        'pixel-amber': '3px 3px 0px 0px #ffb703',
        'pixel-red': '3px 3px 0px 0px #ff2a2a',
        'pixel-purple': '3px 3px 0px 0px #a855f7',
        'glow-cyan': '0 0 14px rgba(0, 240, 255, 0.45)',
        'glow-green': '0 0 14px rgba(0, 255, 102, 0.45)',
        'glow-red': '0 0 14px rgba(255, 42, 42, 0.45)',
        'glow-amber': '0 0 14px rgba(255, 183, 3, 0.45)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        digital: ['"VT323"', 'monospace'],
        mono: ['"Space Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
};
