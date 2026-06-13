/**
 * TasteGo — Onboarding

 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = width * 1.1;

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Descubre los\nsabores que\nte encantan',
    subtitle: 'Encuentra los mejores restaurantes cerca de ti con un solo toque.',
    cta: '¡Empezar!',
  },
  {
    id: '2',
    title: 'Una nueva forma\nde disfrutar\nla comida',
    subtitle: 'Pide, rastrea y disfruta tu comida favorita desde donde estés.',
    cta: '¡Comenzar ahora!',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {/* Círculo grande decorativo */}
      <View style={styles.circleContainer}>
        <View style={styles.circle} />
      </View>

      {/* Contenido inferior */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Footer fijo */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <Button
          title={SLIDES[currentIndex].cta}
          onPress={handleNext}
          variant="accent"
        />

        {/* Skip / Login link */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>
            {currentIndex === SLIDES.length - 1
              ? 'Ya tengo una cuenta'
              : 'Omitir'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
  },
  circleContainer: {
    position: 'absolute',
    top: -CIRCLE_SIZE * 0.15,
    alignSelf: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.horizontalPadding,
    paddingBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.heavy,
    color: Colors.textOnPrimary,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },

  // Footer
  footer: {
    paddingHorizontal: Layout.horizontalPadding,
    paddingBottom: 48,
    paddingTop: 16,
    gap: 16,
    backgroundColor: Colors.primary,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: Colors.textOnPrimary,
    width: 24,
  },
  skipBtn: {
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeights.medium,
  },
});