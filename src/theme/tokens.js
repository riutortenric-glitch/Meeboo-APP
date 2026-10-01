/**
 * Meeboo design tokens — single source of truth for colors, used by
 * tailwind.config.js (NativeWind classes) and by TS code via `@/theme/tokens`.
 * Values sampled from docs/design-reference mockups; refine as screens are built.
 */
const colors = {
  sky: {
    top: '#3F86D6', // gradient start (top of screen)
    bottom: '#8CC3F0', // gradient end
    deep: '#2F5FB8', // highlighted tile (e.g. Sleep)
  },
  glass: {
    DEFAULT: 'rgba(255,255,255,0.22)',
    strong: 'rgba(255,255,255,0.45)',
    border: 'rgba(255,255,255,0.35)',
  },
  ink: {
    DEFAULT: '#1E4E8C', // dark text on light glass
    muted: '#4F7DB8',
  },
  meeboo: '#8FD3F4', // mascot body blue
  flame: '#F59E3A',
  pink: '#F28DB0', // female palette in body-type quiz only
  danger: '#E5484D',
};

module.exports = { colors };
