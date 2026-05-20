import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: '#FF6B6B',
        coralDeep: '#FF4E50',
        peach: '#FFB088',
        cream: '#FFF8F0',
        ink: '#1B1B1F',
        plum: '#5B2E91',
        gold: '#FFB933',
        green: '#5BCB7C',
        sky: '#6FC2FF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
