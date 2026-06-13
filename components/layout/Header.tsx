/**
 * TasteGo — Header reutilizable
 * Soporta: título, botón back, botones de acción derecha
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  transparent?: boolean;
}

export function Header({
  title,
  showBack = false,
  rightComponent,
  style,
  transparent = false,
}: HeaderProps) {
  const router = useRouter();

  return (
    <View
      style={[
        styles.header,
        transparent && styles.transparent,
        style,
      ]}
    >
      {/* Left */}
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Center */}
      {title && (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}

      {/* Right */}
      <View style={[styles.side, styles.rightSide]}>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: Layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.horizontalPadding,
    backgroundColor: Colors.background,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: Colors.textPrimary,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
});