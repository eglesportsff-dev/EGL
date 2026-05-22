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
        ember: '#8B5CF6',
        gold: '#C4B5FD',
      },
      boxShadow: {
        glow: '0 0 20px rgba(139,92,246,0.25)',
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
};
