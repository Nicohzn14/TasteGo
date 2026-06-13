/**
 * TasteGo — Layout del grupo de autenticación
 */
import { Stack } from 'expo-router';

// app/(auth)/_layout.tsx
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="preferences" />  
    </Stack>
  );
}