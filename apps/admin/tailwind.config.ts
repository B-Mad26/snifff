import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { coral: '#FF6B6B', ink: '#1B1B1F', cream: '#FFF8F0', plum: '#5B2E91', green: '#5BCB7C', gold: '#FFB933' } } },
};
export default config;
