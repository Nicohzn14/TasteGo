/**
 * TasteGo — Pantalla de Registro (con autenticación SQLite)
 * UI original preservada al 100%. Solo se reemplaza el handleRegister.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import { FontSizes, FontWeights } from "@/constants/Typography";
import { register } from "@/src/services/authService"; // ← nueva importación
import { useAuth } from "@/src/context/AuthContext";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";





export default function RegisterScreen() {
  const router = useRouter();
  const { setUsuario,  setIsNewUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    fecha_nacimiento: "", 
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Formatea automáticamente DD/MM/AAAA mientras escribe
  const handleFecha = (value: string) => {
    const clean = value.replace(/\D/g, "");
    let formatted = clean;
    if (clean.length >= 3 && clean.length <= 4)
      formatted = clean.slice(0, 2) + "/" + clean.slice(2);
    else if (clean.length >= 5)
      formatted =
        clean.slice(0, 2) + "/" + clean.slice(2, 4) + "/" + clean.slice(4, 8);
    setForm((prev) => ({ ...prev, fecha_nacimiento: formatted }));
  };

  // ─── REEMPLAZA el handleRegister original ────────────────────────────────
  const handleRegister = async () => {
    if (!form.telefono.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio.");
      return;
    }
    if (form.fecha_nacimiento.length < 10) {
      Alert.alert("Error", "Ingresa tu fecha de nacimiento (DD/MM/AAAA).");
      return;
    }
    // validar que sea mayor de 15 años
    const validarEdad = (fecha: string): boolean => {
      // fecha viene en formato DD/MM/AAAA
      const [dia, mes, anio] = fecha.split("/").map(Number);
      const nacimiento = new Date(anio, mes - 1, dia);
      const hoy = new Date();
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      const cumplioEsteAnio =
        hoy.getMonth() > mes - 1 ||
        (hoy.getMonth() === mes - 1 && hoy.getDate() >= dia);
      return cumplioEsteAnio ? edad >= 15 : edad - 1 >= 15;
    };

    if (!validarEdad(form.fecha_nacimiento)) {
      Alert.alert(
        "Edad no permitida",
        "Debes tener al menos 15 años para registrarte.",
      );
      return;
    }

    setLoading(true);

    const result = await register(
      form.name,
      form.email,
      form.password,
      form.confirmPassword,
      form.telefono,
      form.fecha_nacimiento // authService valida que coincidan
    );

    setLoading(false);

    if (result.success && result.usuario) {
      setIsNewUser(true);                  // ← primero el flag
      await setUsuario(result.usuario); // ← guarda en contexto
      // Ir a pantalla de preferencias 
      router.replace("/(auth)/preferences");
    } else {
      Alert.alert("Error al registrarse", result.error);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
  <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Crear cuenta</Text>
        </View>

        <Text style={styles.sub}>
          Completa tu información para comenzar
        </Text>

        <Input
          label="Nombre completo"
          placeholder="José Martínez"
          value={form.name}
          onChangeText={updateField("name")}
          autoCapitalize="words"
        />

        <View style={{ marginTop: 12 }}>
          <Input
            label="Correo electrónico"
            placeholder="tu@correo.com"
            value={form.email}
            onChangeText={updateField("email")}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Input
            label="Teléfono"
            placeholder="300 123 4567"
            value={form.telefono}
            onChangeText={updateField("telefono")}
            keyboardType="phone-pad"
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Input
            label="Fecha de nacimiento"
            placeholder="DD/MM/AAAA"
            value={form.fecha_nacimiento}
            onChangeText={handleFecha}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={form.password}
            onChangeText={updateField("password")}
            secureTextEntry
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Input
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChangeText={updateField("confirmPassword")}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleRegister}
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
              <Text style={styles.btnTxt}>Crear cuenta</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchTxt}>
            ¿Ya tienes cuenta?
          </Text>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.switchLink}>
              Iniciar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 18,
    color: Colors.textPrimary,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  sub: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 24,
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

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  switchTxt: {
    fontSize: 13,
    color: "#8E8E93",
  },

  switchLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "800",
  },
});