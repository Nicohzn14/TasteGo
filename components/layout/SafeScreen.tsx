/**
 * TasteGo — Wrapper base para todas las pantallas
 * Aplica SafeAreaView + fondo + padding horizontal estándar
 */
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface SafeScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  padded?: boolean;
}

export function SafeScreen({
  children,
  scrollable = false,
  style,
  contentStyle,
  backgroundColor = Colors.background,
  statusBarStyle = 'dark-content',
  padded = true,
}: SafeScreenProps) {
  const content = (
    <View
      style={[
        styles.content,
        padded && styles.padded,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Layout.horizontalPadding,
  },
  scrollContent: {
    flexGrow: 1,
  },
});