// app/(tabs)/favorites.tsx

import React from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Linking, Platform, Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useFavorites } from '@/src/context/FavoritesContext';
import type { RestauranteMapa } from '@/src/types/restaurant';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH  = width - Layout.horizontalPadding * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.54;

const FALLBACK_URI =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600';

// ── Deep link a Maps ──────────────────────────────────────────────────────────
function comoLlegar(r: RestauranteMapa) {
  const { latitude, longitude } = r.coordenadas;
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
}

// ── Imagen con fallback ───────────────────────────────────────────────────────
function CardImage({ uri }: { uri: string | null }) {
  const [error, setError] = React.useState(false);
  return (
    <Image
      source={{ uri: !uri || error ? FALLBACK_URI : uri }}
      style={styles.cardImg}
      onError={() => setError(true)}
    />
  );
}

// ── Card individual ───────────────────────────────────────────────────────────
interface FavCardProps {
  item:     RestauranteMapa;
  onQuitar: () => void;
  onRuta:   () => void;
  onPress:   () => void;
}


function FavCard({ item, onQuitar, onRuta, onPress }: FavCardProps) {
  const ratingDisplay =
    item.calificacion > 0
      ? `${(item.calificacion * 2).toFixed(1)}/10`
      : '';

  return (

    <TouchableOpacity  onPress={onPress} activeOpacity={0.88}>
    <View style={styles.card}>
      {/* Imagen de fondo */}
      <CardImage uri={item.foto} />

      {/* Overlay oscuro */}
      <View style={styles.overlay} />

      {/* Corazón — quitar favorito */}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={onQuitar}
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      >
        <Text style={styles.heartIco}>❤️</Text>
      </TouchableOpacity>

      {/* Info inferior */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.nombre}
        </Text>

        <View style={styles.cardMeta}>
          {ratingDisplay !== '' && (
            <>
              <Text style={styles.cardMetaTxt}>{ratingDisplay}</Text>
              <Text style={styles.cardMetaDot}>·</Text>
            </>
          )}
          <Text style={styles.cardMetaTxt}>{item.precioNivel}</Text>
          <Text style={styles.cardMetaDot}>·</Text>
          <Text style={styles.cardMetaTxt}>{item.tiempoEntrega}</Text>
        </View>

        {item.abierto !== null && (
          <Text
            style={[
              styles.cardOpen,
              { color: item.abierto ? Colors.success : Colors.error },
            ]}
          >
            {item.abierto ? '● Abierto' : '● Cerrado'}
          </Text>
        )}
      </View>

      {/* Botón ruta */}
      <TouchableOpacity
        style={styles.routeBtn}
        onPress={onRuta}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Text style={styles.routeIco}>➤</Text>
      </TouchableOpacity>
    </View>
    </TouchableOpacity>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function FavoritesScreen() {

  const router = useRouter();
  const { favoritos, quitarFavorito, cargando } = useFavorites();

  const irADetalle = (item: RestauranteMapa) => {
    router.push({
      pathname: '../restaurant/[id]',
      params: { id: item.id, data: JSON.stringify(item) },
    });
  };
  

  if (cargando) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        {favoritos.length > 0 && (
          <Text style={styles.headerCount}>
            {favoritos.length} guardado{favoritos.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FavCard
            item={item}
            onQuitar={() => quitarFavorito(item.id)}
            onRuta={() => comoLlegar(item)}
            onPress={() => irADetalle(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤍</Text>
            <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
            <Text style={styles.emptyMsg}>
              Toca el ❤️ en cualquier restaurante en el mapa para guardarlo aquí.
            </Text>
          </View>
        }
        ListFooterComponent={
          favoritos.length > 0 ? (
            <Text style={styles.footerNote}>
              Toca el corazón para quitar un favorito.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.horizontalPadding,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.heavy,
    color: Colors.textPrimary,
  },
  headerCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  // Lista
  listContent: {
    paddingHorizontal: Layout.horizontalPadding,
    paddingBottom: 100,
    gap: 14,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImg: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // Corazón
  heartBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  heartIco: { fontSize: 18 },

  // Info inferior
  cardInfo: {
    position: 'absolute', bottom: 0, left: 0,
    right: 52,
    padding: 14, gap: 4,
  },
  cardName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  cardMeta: {
    flexDirection: 'row', alignItems: 'center',
    flexWrap: 'wrap', gap: 4,
  },
  cardMetaTxt: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.85)' },
  cardMetaDot: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.5)'  },
  cardOpen:    { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },

  // Botón ruta
  routeBtn: {
    position: 'absolute', bottom: 14, right: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  routeIco: { color: '#fff', fontSize: 15, fontWeight: FontWeights.bold },

  // Vacío
  empty: {
    alignItems: 'center', paddingTop: 80,
    paddingHorizontal: 40, gap: 12,
  },
  emptyEmoji: { fontSize: 54 },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  emptyMsg: {
    fontSize: FontSizes.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  footerNote: {
    fontSize: FontSizes.xs, color: Colors.textMuted,
    textAlign: 'center', paddingVertical: 12,
  },
});