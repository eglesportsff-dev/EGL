export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#070B1A',
        card: '#111827',
        primary: '#8B5CF6',
        secondary: '#9CA3AF',
        arena: '#070B1A',
        panel: '#111827',
        line: '#26314f',
        ember: '#FF5E14',
        gold: '#FFB800',
        fire: {
          400: '#FF7A2F',
          500: '#FF5E14',
          600: '#E04803',
        },
        booyah: {
          400: '#FACC15',
          500: '#FFB800',
          600: '#D97706',
        },
        cyber: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        carbon: {
          900: '#060913',
          800: '#0C1120',
          700: '#131A30',
          600: '#1C2642',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(139,92,246,0.25)',
        'glow-fire': '0 0 25px rgba(255,94,20,0.35)',
        'glow-booyah': '0 0 25px rgba(255,184,0,0.35)',
        'glow-cyber': '0 0 20px rgba(6,182,212,0.35)',
        'glow-card': '0 10px 30px -10px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
};
