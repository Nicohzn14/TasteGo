// app/(auth)/preferences.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useAuth } from '@/src/context/AuthContext';
import { getDB } from '@/src/database/bd';

const OPCIONES = [
  { id: 1, nombre: 'Típica',    emoji: '🍲', descripcion: 'Bandeja paisa, sancocho, ajiaco' },
  { id: 2, nombre: 'Rápida',    emoji: '🍔', descripcion: 'Hamburguesas, pizzas, perros' },
  { id: 3, nombre: 'Gourmet',   emoji: '🍽️', descripcion: 'Alta gastronomía, cocina de autor' },
  { id: 4, nombre: 'Saludable', emoji: '🥗', descripcion: 'Ensaladas, bowls, opciones fit' },
  { id: 5, nombre: 'Mariscos',  emoji: '🦐', descripcion: 'Pescados y frutos de mar' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { usuario, setPreferencias, setIsNewUser } = useAuth();
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
 


  const toggle = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

    const handleGuardar = async () => {
  if (seleccionados.length === 0) {
    Alert.alert('Selecciona al menos una preferencia');
    return;
  }
  

    setLoading(true);
  try {
    const db = await getDB();
    const nombresSeleccionados: string[] = [];

    for (const id of seleccionados) {
      const opcion = OPCIONES.find((o) => o.id === id)!;
      await db.runAsync(
        `INSERT INTO preferencias (id_usuario, tipo_comida) VALUES (?, ?)`,
        [usuario!.id_usuario, opcion.nombre]
      );
      nombresSeleccionados.push(opcion.nombre);
    }

    await setPreferencias(nombresSeleccionados); // ← guarda en contexto 
    setIsNewUser(false);          // ← apaga el flag
    router.replace('/(tabs)');
  } catch (e) {
    Alert.alert('Error', 'No se pudieron guardar las preferencias.');
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🍴</Text>
          <Text style={styles.title}>¿Qué te gusta comer?</Text>
          <Text style={styles.subtitle}>
            Selecciona tus preferencias y te mostraremos los mejores restaurantes para ti
          </Text>
        </View>

        <View style={styles.grid}>
          {OPCIONES.map((op) => {
            const selected = seleccionados.includes(op.id);
            return (
              <TouchableOpacity
                key={op.id}
                style={[styles.card, selected && styles.cardSelected]}
                onPress={() => toggle(op.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardEmoji}>{op.emoji}</Text>
                <Text style={[styles.cardNombre, selected && styles.cardNombreSelected]}>
                  {op.nombre}
                </Text>
                <Text style={styles.cardDesc}>{op.descripcion}</Text>
                {selected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            title={`Continuar${seleccionados.length > 0 ? ` (${seleccionados.length})` : ''}`}
            onPress={handleGuardar}
            loading={loading}
            variant="primary"
          />
          <TouchableOpacity
            onPress={() => {
  setIsNewUser(false);          // ← también aquí
  router.replace('/(tabs)');
}}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Omitir por ahora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    gap: 10,
  },
  emoji: { fontSize: 52 },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Layout.radius.xl,
    padding: 16,
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  cardSelected: {
    backgroundColor: `${Colors.primary}12`,
    borderColor: Colors.primary,
  },
  cardEmoji: { fontSize: 32 },
  cardNombre: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  cardNombreSelected: { color: Colors.primary },
  cardDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#fff', fontSize: 12, fontWeight: FontWeights.bold },
  footer: {
    paddingTop: 28,
    paddingBottom: 48,
    gap: 12,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
});