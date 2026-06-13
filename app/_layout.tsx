// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { FavoritesProvider } from '@/src/context/FavoritesContext';
import { RestaurantesProvider } from '@/src/context/RestaurantesContext';
import { initDB } from '@/src/database/initDB';

function RootNavigator() {
  const { usuario, isLoading, isNewUser } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabs      = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    const inSplash    = !segments[0];
    const inRestaurant = segments[0] === 'restaurant';

    if (inSplash) return;

    if (usuario && !inTabs && !isNewUser && !inRestaurant) {
  router.replace('/(tabs)');
} else if (!usuario && !inAuthGroup && !inOnboarding && !inSplash && !inRestaurant) {
  router.replace('/(auth)/login');
}
  }, [usuario, isLoading, segments]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="onboarding" />
  <Stack.Screen name="(auth)" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="restaurant" />  
</Stack>
  );
}

export default function RootLayout() {
  useEffect(() => { initDB(); }, []);

  return (
    <AuthProvider>
      <FavoritesProvider>
        <RestaurantesProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </RestaurantesProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}