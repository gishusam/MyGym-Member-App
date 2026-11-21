/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#1C2B3B',
    tint: '#243648',
    background: '#EAF3FB',
    foreground: '#1C2B3B',
    card: '#FFFFFF',
    cardForeground: '#1C2B3B',
    primary: '#243648',
    primaryForeground: '#FFFFFF',
    secondary: '#D9E8F5',
    secondaryForeground: '#243648',
    muted: '#DCE8F2',
    mutedForeground: '#718195',
    accent: '#F9D8D4',
    accentForeground: '#B94F4C',
    destructive: '#B94F4C',
    destructiveForeground: '#FFFFFF',
    border: '#D5E1EB',
    input: '#D5E1EB',
    forestDeep: '#243648',
    forestMid: '#E96F69',
    lime: '#FFD4CE',
    warm: '#FBE8E5',
    gold: '#C75D57',
    forestText: '#F5F8FC',
    forestCaption: '#AEBBC8',
    forestMuted: '#D1DCE7',
    forestOverlay: 'rgba(255,255,255,0.12)',
    forestPill: 'rgba(255,255,255,0.11)',
    forestLine: 'rgba(255,255,255,0.18)',
    forestRing: 'rgba(221,235,248,0.16)',
    forestRingSoft: 'rgba(221,235,248,0.13)',
    forestRingFaint: 'rgba(221,235,248,0.10)',
  },
  radius: 20,
};

export default colors;
