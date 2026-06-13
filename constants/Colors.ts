/**
 * TasteGo — Paleta de colores oficial
 * Extraída directamente del diseño Figma
 */
export const Colors = {
  // Brand
  primary: '#E8472A',       // Rojo coral TasteGo
  primaryDark: '#C73D24',   // Hover / pressed
  primaryLight: '#FF6B4A',  // Tint suave


  innactive: '#8E8E93',
  // CTA / Accent
  accent: '#F5A623',        // Naranja amber — botones principales
  accentDark: '#D4911F',

  // Backgrounds
  background: '#FFFFFF',
  backgroundAlt: '#F7F7F7',
  backgroundCard: '#FFFFFF',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#8E8E93',
  textMuted: '#C7C7CC',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // UI
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  shadow: 'rgba(0,0,0,0.08)',
  overlay: 'rgba(0,0,0,0.5)',

  // Map / special
  mapTint: 'rgba(232,71,42,0.15)',
} as const;

export type ColorKey = keyof typeof Colors;