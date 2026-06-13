// app/(tabs)/index.tsx
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useAuth } from '@/src/context/AuthContext';
import { useFavorites } from '@/src/context/FavoritesContext';
import { useRestaurantes } from '@/src/context/RestaurantesContext';
import type { RestauranteMapa } from '@/src/types/restaurant';

// ── Imagen con fallback ───────────────────────────────────────────────────────
function RestImg({ uri, style }: { uri: string | null; style: any }) {
  const [error, setError] = React.useState(false);
  if (!uri || error) {
    return (
      <View style={[style, { backgroundColor: Colors.backgroundAlt,
        alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 28 }}>🍽️</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={style} onError={() => setError(true)} />;
}

// ── Card horizontal ───────────────────────────────────────────────────────────
function CardDestacada({ item, isFav, onFav, onPress }: {
  item: RestauranteMapa; isFav: boolean;
  onFav: () => void; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={cardH.wrap} onPress={onPress} activeOpacity={0.88}>
      <RestImg uri={item.foto} style={cardH.img} />
      {item.abierto !== null && (
        <View style={[cardH.badge,
          { backgroundColor: item.abierto ? Colors.success : Colors.error }]}>
          <Text style={cardH.badgeTxt}>{item.abierto ? 'Abierto' : 'Cerrado'}</Text>
        </View>
      )}
      <TouchableOpacity style={cardH.favBtn} onPress={onFav}>
        <Text style={{ fontSize: 16 }}>{isFav ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
      <View style={cardH.info}>
        <Text style={cardH.nombre} numberOfLines={1}>{item.nombre}</Text>
        <Text style={cardH.tipo}   numberOfLines={1}>{item.tipo}</Text>
        <View style={cardH.metaRow}>
          {item.calificacion > 0 && <Text style={cardH.meta}>⭐ {item.calificacion}</Text>}
          <Text style={cardH.dot}>·</Text>
          <Text style={cardH.meta}>📍 {item.distancia}</Text>
          <Text style={cardH.dot}>·</Text>
          <Text style={cardH.meta}>{item.precioNivel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cardH = StyleSheet.create({
  wrap: {
    width: 200, backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  img:  { width: '100%', height: 120, resizeMode: 'cover' },
  badge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Layout.radius.full,
  },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: FontWeights.semibold },
  favBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  info:    { padding: 12, gap: 3 },
  nombre:  { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  tipo:    { fontSize: FontSizes.xs, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta:    { fontSize: FontSizes.xs, color: Colors.textSecondary },
  dot:     { fontSize: FontSizes.xs, color: Colors.textMuted },
});

// ── Card lista ────────────────────────────────────────────────────────────────
function CardLista({ item, isFav, onFav, onPress }: {
  item: RestauranteMapa; isFav: boolean;
  onFav: () => void; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={cardL.wrap} onPress={onPress} activeOpacity={0.85}>
      <RestImg uri={item.foto} style={cardL.img} />
      <View style={cardL.info}>
        <Text style={cardL.nombre} numberOfLines={1}>{item.nombre}</Text>
        <Text style={cardL.tipo}   numberOfLines={1}>{item.tipo}</Text>
        <View style={cardL.metaRow}>
          {item.calificacion > 0 && <Text style={cardL.meta}>⭐ {item.calificacion}</Text>}
          <Text style={cardL.dot}>·</Text>
          <Text style={cardL.meta}>📍 {item.distancia}</Text>
          <Text style={cardL.dot}>·</Text>
          <Text style={cardL.meta}>{item.tiempoEntrega}</Text>
        </View>
        {item.abierto !== null && (
          <Text style={[cardL.estado,
            { color: item.abierto ? Colors.success : Colors.error }]}>
            {item.abierto ? '● Abierto' : '● Cerrado'}
          </Text>
        )}
      </View>
      <TouchableOpacity style={cardL.favBtn} onPress={onFav}>
        <Text style={{ fontSize: 18 }}>{isFav ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const cardL = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.xl, marginBottom: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  img:     { width: 80, height: 80, resizeMode: 'cover' },
  info:    { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
  nombre:  { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  tipo:    { fontSize: FontSizes.xs, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta:    { fontSize: FontSizes.xs, color: Colors.textSecondary },
  dot:     { fontSize: FontSizes.xs, color: Colors.textMuted },
  estado:  { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, marginTop: 2 },
  favBtn:  { paddingRight: 14 },
});

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { usuario, preferencias } = useAuth();
  const { esFavorito, toggleFavorito } = useFavorites();
  const { restaurantes, cargando, error, recargar, permisoDenegado } = useRestaurantes();

  const nombre = usuario?.nombre?.split(' ')[0] ?? 'Bienvenido';

  // "Para ti" — filtrado por preferencias
  const paraTi = useMemo(() => {
    if (!preferencias || preferencias.length === 0)
      return restaurantes.slice(0, 6);
    return restaurantes.filter((r) =>
      preferencias.some((p) => r.tipo.toLowerCase().includes(p.toLowerCase()))
    );
  }, [restaurantes, preferencias]);

  // "Cerca de ti" — todos ordenados por distancia
  const cercaDeTi = useMemo(() =>
    [...restaurantes].sort((a, b) => a.distanciaRaw - b.distanciaRaw),
  [restaurantes]);

  const irADetalle = (item: RestauranteMapa) => {
    router.push({
      pathname: '../restaurant/[id]',
      params: { id: item.id, data: JSON.stringify(item) },
    });
  };

  return (
    <SafeScreen padded={false} scrollable>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola, {nombre}! 👋</Text>
            <Text style={styles.location}>📍 Sincelejo, Sucre</Text>
          </View>
        </View>

        {/* Estado de carga / error / permiso */}
        {cargando && (
          <View style={styles.estadoWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.estadoTxt}>Buscando restaurantes cerca de ti…</Text>
          </View>
        )}

        {!cargando && permisoDenegado && (
          <View style={styles.estadoWrap}>
            <Text style={styles.estadoEmoji}>📍</Text>
            <Text style={styles.estadoTxt}>
              Activa la ubicación para ver restaurantes cercanos.
            </Text>
            <TouchableOpacity style={styles.recargarBtn} onPress={recargar}>
              <Text style={styles.recargarTxt}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        )}

        {!cargando && error && !permisoDenegado && (
          <View style={styles.estadoWrap}>
            <Text style={styles.estadoEmoji}>⚠️</Text>
            <Text style={styles.estadoTxt}>{error}</Text>
            <TouchableOpacity style={styles.recargarBtn} onPress={recargar}>
              <Text style={styles.recargarTxt}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sección: Para ti */}
        {!cargando && restaurantes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Para ti</Text>
                {preferencias.length > 0 && (
                  <Text style={styles.sectionSub}>
                    Basado en: {preferencias.join(', ')}
                  </Text>
                )}
              </View>
            </View>

            {paraTi.length > 0 ? (
              <FlatList
                data={paraTi}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                renderItem={({ item }) => (
                  <CardDestacada
                    item={item}
                    isFav={esFavorito(item.id)}
                    onFav={() => toggleFavorito(item)}
                    onPress={() => irADetalle(item)}
                  />
                )}
              />
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionTxt}>
                  No encontramos restaurantes para tus preferencias cerca.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Sección: Cerca de ti */}
        {!cargando && restaurantes.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cerca de ti</Text>
              <TouchableOpacity onPress={recargar}>
                <Text style={styles.seeAll}>Actualizar</Text>
              </TouchableOpacity>
            </View>
            {cercaDeTi.map((r) => (
              <CardLista
                key={r.id}
                item={r}
                isFav={esFavorito(r.id)}
                onFav={() => toggleFavorito(r)}
                onPress={() => irADetalle(r)}
              />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Layout.horizontalPadding,
    paddingTop: Layout.spacing.lg, paddingBottom: Layout.spacing.md,
    marginTop: 38,
  },
  greeting: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  location: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  notifBtn: {
    position: 'relative', width: 44, height: 44,
    backgroundColor: Colors.backgroundAlt, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 20 },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5, borderColor: Colors.background,
  },
  discountBanner: {
    marginHorizontal: Layout.horizontalPadding,
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.xl,
    padding: Layout.spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  discountLeft:     { gap: 4 },
  discountPercent:  { fontSize: FontSizes.xl, fontWeight: FontWeights.heavy, color: Colors.textOnPrimary },
  discountSubtitle: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.8)' },
  discountCta: {
    marginTop: 8, backgroundColor: Colors.accent,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Layout.radius.full, alignSelf: 'flex-start',
  },
  discountCtaText: { color: Colors.textOnPrimary, fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  discountEmoji: { fontSize: 52 },

  // Estado
  estadoWrap: {
    alignItems: 'center', paddingVertical: 40,
    paddingHorizontal: Layout.horizontalPadding, gap: 12,
  },
  estadoEmoji: { fontSize: 40 },
  estadoTxt: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  recargarBtn: {
    backgroundColor: Colors.primary, paddingVertical: 10,
    paddingHorizontal: 24, borderRadius: Layout.radius.lg,
  },
  recargarTxt: { color: '#fff', fontWeight: FontWeights.bold, fontSize: FontSizes.sm },

  // Secciones
  section:     { marginBottom: Layout.spacing.lg },
  lastSection: { paddingHorizontal: Layout.horizontalPadding, marginBottom: Layout.spacing.xxl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Layout.horizontalPadding, marginBottom: Layout.spacing.md,
  },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  sectionSub:   { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  seeAll:       { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.medium },
  horizontalList: { paddingHorizontal: Layout.horizontalPadding },
  emptySection: { paddingHorizontal: Layout.horizontalPadding, paddingVertical: 20, alignItems: 'center' },
  emptySectionTxt: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },
});