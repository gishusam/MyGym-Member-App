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
    text: '#18362C',
    tint: '#245640',
    background: '#F6F7F3',
    foreground: '#18362C',
    card: '#FFFFFF',
    cardForeground: '#18362C',
    primary: '#245640',
    primaryForeground: '#FFFFFF',
    secondary: '#E9EEE9',
    secondaryForeground: '#274538',
    muted: '#EEF1EC',
    mutedForeground: '#7A887F',
    accent: '#DCE9DF',
    accentForeground: '#245640',
    destructive: '#B34F47',
    destructiveForeground: '#FFFFFF',
    border: '#E4E9E3',
    input: '#E4E9E3',
    forestDeep: '#183A2C',
    forestMid: '#32684D',
    lime: '#D8E8A5',
    warm: '#F3EFE6',
    gold: '#B9893E',
    forestText: '#F5F4EC',
    forestCaption: '#A8B7A8',
    forestMuted: '#C4D0C4',
    forestOverlay: 'rgba(255,255,255,0.12)',
    forestPill: 'rgba(255,255,255,0.11)',
    forestLine: 'rgba(255,255,255,0.18)',
    forestRing: 'rgba(220,233,223,0.12)',
    forestRingSoft: 'rgba(220,233,223,0.10)',
    forestRingFaint: 'rgba(220,233,223,0.09)',
  },
  radius: 20,
};

export default colors;
