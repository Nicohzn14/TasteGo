/**
 * TasteGo — Constantes de layout y espaciado
 */
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  // Screen
  screenWidth: width,
  screenHeight: height,

  // Spacing (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Component sizes
  buttonHeight: 52,
  inputHeight: 52,
  bottomTabHeight: 84,
  headerHeight: 56,

  // Cards
  cardPadding: 16,
  restaurantCardWidth: width * 0.42,
  foodCardWidth: width * 0.44,

  // Safe area padding
  horizontalPadding: 20,
} as const;