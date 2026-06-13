/**
 * TasteGo 
 *
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useAuth } from '@/src/context/AuthContext';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.45;


export default function SplashScreen() {
  const router = useRouter();
const { usuario } = useAuth();
  // Animaciones
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Secuencia de animación del splash
    Animated.sequence([
      // 1. Fade in del fondo
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 2. El círculo y logo escalan
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(circleScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navegar a onboarding
   const timer = setTimeout(() => {
  if (usuario) {
    router.replace('/(tabs)');
  } else {
    router.replace('/onboarding');
  }
}, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Círculo blanco con logo */}
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              { scale: circleScale },
            ],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {/* Logo TG */}
         <Image 
              source={require('../assets/images/TasteGoMiniLogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
        </Animated.View>
      </Animated.View>

      {/* Tagline opcional */}
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: scaleAnim },
        ]}
      >
        TasteGo
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.heavy,
    color: Colors.primary,
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textOnPrimary,
    letterSpacing: 1,
    fontFamily:"Palatino Linotype", fontStyle: "italic"
  },
  logoImage: {
    width: 150,  
    height: 60,  
    
  },
});