/**
 * TasteGo — Botón reutilizable
 *
 * Variantes:
 *  - primary   → fondo rojo coral (Color brand)
 *  - accent    → fondo naranja amber (CTA principal)
 *  - outline   → borde rojo, fondo transparente
 *  - ghost     → sin borde ni fondo
 *
 * Tamaños:
 *  - sm | md | lg
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  style,
  textStyle,
}: ButtonProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost'
            ? Colors.primary
            : Colors.textOnPrimary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <Text style={labelStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },

  // Variantes
  primary: {
    backgroundColor: Colors.primary,
  },
  accent: {
    backgroundColor: Colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Tamaños
  size_sm: {
    height: 40,
    paddingHorizontal: 16,
  },
  size_md: {
    height: Layout.buttonHeight,
    paddingHorizontal: 24,
  },
  size_lg: {
    height: 58,
    paddingHorizontal: 32,
  },

  // Labels por variante
  label: {
    fontWeight: FontWeights.semibold,
  },
  label_primary: {
    color: Colors.textOnPrimary,
  },
  label_accent: {
    color: Colors.textOnPrimary,
  },
  label_outline: {
    color: Colors.primary,
  },
  label_ghost: {
    color: Colors.primary,
  },

  // Labels por tamaño
  labelSize_sm: {
    fontSize: FontSizes.sm,
  },
  labelSize_md: {
    fontSize: FontSizes.base,
  },
  labelSize_lg: {
    fontSize: FontSizes.md,
  },

  disabled: {
    opacity: 0.5,
  },
});