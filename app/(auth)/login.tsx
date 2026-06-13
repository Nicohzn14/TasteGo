/**
 * TasteGo — Pantalla de Login (con autenticación SQLite)
 * UI original preservada al 100%. Solo se reemplaza el handleLogin.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { login } from '@/src/services/authService';  // ← nueva importación
// En LoginScreen, agrega el import y el hook:
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUsuario } = useAuth();

  // ─── REEMPLAZA el handleLogin original ───────────────────────────────────
  const handleLogin = async () => {
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.success && result.usuario) {
      // Login correcto → navegar a la app principal
      await setUsuario(result.usuario);
      console.log(result.usuario);
  router.replace('/(tabs)');
    } else {
      // Credenciales incorrectas o error → mostrar mensaje
      Alert.alert('Error al iniciar sesión', result.error);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeScreen padded={false}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header con logo */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/TasteGoLogo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>¡Bienvenido de vuelta!</Text>
            <Text style={styles.welcomeSubtitle}>
              Inicia sesión para continuar
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Input
              label="Correo electrónico"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Olvidé contraseña */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.88}
                      style={styles.btnWrapper}
                    >
                      <LinearGradient
                        colors={[Colors.accent, Colors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btn}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.btnTxt}>Iniciar Sesion</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
          </View>

          {/* Divider social */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botones sociales */}
          <View style={styles.socialRow}>
            {SOCIAL_PROVIDERS.map((p) => (
              <TouchableOpacity key={p.id} style={styles.socialBtn}>
                <Text style={styles.socialIcon}>{p.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Link a registro */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerLink}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const SOCIAL_PROVIDERS = [
  { id: 'google', icon: 'G', label: 'Google' },
  { id: 'facebook', icon: 'f', label: 'Facebook' },
  { id: 'apple', icon: 'A', label: 'Apple' },
];

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Layout.horizontalPadding,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 40,
    gap: 8,
  },
  logo: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.heavy,
    color: Colors.primary,
    fontStyle: 'italic',
    letterSpacing: -1,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: Layout.radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  socialIcon: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  registerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  logoImage: {
    width: 200,  
    height: 140,  
    marginBottom: 16,
  },
    btnWrapper: {
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 20,
  },

  btn: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  btnTxt: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
});