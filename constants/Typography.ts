/**
 * TasteGo — Sistema tipográfico
 * Basado en el diseño Figma: pesos y tamaños detectados
 */
import { StyleSheet } from 'react-native';

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 38,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const Typography = StyleSheet.create({
  display: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.heavy,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  h3: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  body: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
  },
  caption: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: 18,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});