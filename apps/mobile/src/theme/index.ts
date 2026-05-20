// Snifff design tokens — keep in sync with packages/shared/src/theme.ts

export const colors = {
  coral: '#FF6B6B',
  coralDeep: '#FF4E50',
  peach: '#FFB088',
  cream: '#FFF8F0',
  bone: '#FFFFFF',
  ink: '#1B1B1F',
  grey: '#8E8E93',
  greyL: '#E5E5E9',
  sky: '#6FC2FF',
  green: '#5BCB7C',
  gold: '#FFB933',
  plum: '#5B2E91',
  lightCoral: '#FFE5E5',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
export const space  = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const fonts  = {
  display: 'System',           // map to Fraunces / Recoleta in production
  body: 'System',
};
export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, color: colors.ink },
  h2: { fontSize: 24, fontWeight: '700' as const, color: colors.ink },
  body: { fontSize: 16, color: colors.ink },
  caption: { fontSize: 12, color: colors.grey },
};

export const theme = { colors, radius, space, fonts, typography };
export type Theme = typeof theme;
