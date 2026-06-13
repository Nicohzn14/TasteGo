// app/restaurant/[id].tsx
import React from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  ScrollView, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useFavorites } from '@/src/context/FavoritesContext';
import type { RestauranteMapa } from '@/src/types/restaurant';

const FALLBACK = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800';

export default function RestaurantDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { esFavorito, toggleFavorito } = useFavorites();

  // El item viene serializado desde Home o Mapa
  const item: RestauranteMapa = params.data
    ? JSON.parse(String(params.data))
    : null;

  if (!item) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errTxt}>No se encontró el restaurante.</Text>
        <TouchableOpacity style={styles.btnBack} onPress={() => router.back()}>
          <Text style={styles.btnBackTxt}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isFav = esFavorito(item.id);

  const comoLlegar = () => {
    const { latitude, longitude } = item.coordenadas;
    const url = Platform.select({
      ios:     `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });
    if (url)
      Linking.openURL(url).catch(() =>
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
        )
      );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Imagen hero */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: item.foto ?? FALLBACK }}
            style={styles.heroImage}
            defaultSource={{ uri: FALLBACK }}
          />
          {/* Overlay degradado */}
          <View style={styles.heroOverlay} />

          {/* Botón volver */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backTxt}>◀</Text>
          </TouchableOpacity>

          {/* Botón favorito */}
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorito(item)}
          >
            <Text style={{ fontSize: 20 }}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Card de contenido */}
        <View style={styles.card}>

          {/* Nombre y calificación */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{item.nombre}</Text>
            {item.calificacion > 0 && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingTxt}>⭐ {item.calificacion}</Text>
                <Text style={styles.reviewsTxt}>({item.totalReviews})</Text>
              </View>
            )}
          </View>

          <Text style={styles.tipo}>{item.tipo}</Text>




          <View style={styles.infoRow}>
              {/* Badge abierto sobre la imagen */}
          {item.abierto !== null && (
            <View style={[styles.openBadge,
              { backgroundColor: item.abierto ? Colors.success : Colors.error }]}>
              <Text style={styles.openBadgeTxt}>
                {item.abierto ? '● Abierto ahora' : '● Cerrado'}
              </Text>
            </View>
          )}
          </View>

          {/* Info rápida */}
          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipEmoji}>📍</Text>
              <Text style={styles.infoChipTxt}>{item.distancia}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipEmoji}>⏱️</Text>
              <Text style={styles.infoChipTxt}>{item.tiempoEntrega}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipEmoji}>💰</Text>
              <Text style={styles.infoChipTxt}>{item.precioNivel}</Text>
            </View>
          </View>

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Sobre el restaurante</Text>
          <Text style={styles.description}>
            Bienvenido a {item.nombre}, uno de los mejores lugares de {item.tipo.toLowerCase()} en Sincelejo.
            Disfruta de una experiencia gastronómica única con los mejores ingredientes y atención de calidad.
          </Text>

          {/* Botones de acción */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.btnRuta} onPress={comoLlegar}>
              <Text style={styles.btnRutaEmoji}>🗺️</Text>
              <Text style={styles.btnRutaTxt}>Cómo llegar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnMenu}
              onPress={() =>
                router.push({
                  pathname: '../restaurant/menu',
                  params: { id: item.id, data: String(params.data) },
                })
              }
            >
              <Text style={styles.btnMenuTxt}>Ver menú</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background, padding: Layout.horizontalPadding, gap: 16,
  },
  errTxt:    { fontSize: FontSizes.md, color: Colors.textPrimary, textAlign: 'center' },
  btnBack:   { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: Layout.radius.md },
  btnBackTxt:{ color: '#fff', fontWeight: FontWeights.bold },

  // Hero
  heroContainer: { height: 400, position: 'relative' },
  heroImage:     { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay:   {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backBtn: {
    position: 'absolute', top: 50, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { fontSize: 16 },
  favBtn: {
    position: 'absolute', top: 50, right: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  openBadge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Layout.radius.full,
  },
  openBadgeTxt: { color: '#fff', fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },

  // Card contenido
  card: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -20, padding: 24, gap: 8,
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 12,
  },
  title: {
    flex: 1, fontSize: FontSizes.xxl,
    fontWeight: FontWeights.heavy, color: Colors.textPrimary,
  },
  ratingBadge: {
    alignItems: 'center', gap: 2,
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Layout.radius.md,
  },
  ratingTxt:  { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  reviewsTxt: { fontSize: 10, color: Colors.textSecondary },
  tipo:       { fontSize: FontSizes.base, color: Colors.textSecondary },

  // Chips de info
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Layout.radius.full,
  },
  infoChipEmoji: { fontSize: 14 },
  infoChipTxt:   { fontSize: FontSizes.sm, color: Colors.textPrimary, fontWeight: FontWeights.medium },

  // Descripción
  sectionTitle: {
    fontSize: FontSizes.md, fontWeight: FontWeights.bold,
    color: Colors.textPrimary, marginTop: 8,
  },
  description: {
    fontSize: FontSizes.sm, color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Botones
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnRuta: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: Colors.primary,
    paddingVertical: 14, borderRadius: Layout.radius.lg,
  },
  btnRutaEmoji: { fontSize: 18 },
  btnRutaTxt:   { color: Colors.primary, fontWeight: FontWeights.bold, fontSize: FontSizes.base },
  btnMenu: {
    flex: 1, backgroundColor: Colors.primary,
    paddingVertical: 14, borderRadius: Layout.radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  btnMenuTxt: { color: '#fff', fontWeight: FontWeights.bold, fontSize: FontSizes.base },
});