// Canonical design tokens, mirrored in apps/mobile/src/theme and apps/web tailwind config.
export const COLORS = {
  coral: '#FF6B6B',
  coralDeep: '#FF4E50',
  peach: '#FFB088',
  cream: '#FFF8F0',
  ink: '#1B1B1F',
  grey: '#8E8E93',
  greyL: '#E5E5E9',
  sky: '#6FC2FF',
  green: '#5BCB7C',
  gold: '#FFB933',
  plum: '#5B2E91',
} as const;

export type ColorToken = keyof typeof COLORS;
