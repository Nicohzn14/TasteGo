// app/(tabs)/mapa.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  FlatList,
  Image,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useAuth } from '@/src/context/AuthContext';
import type { RestauranteMapa } from '@/src/types/restaurant';
import { useFavorites } from '@/src/context/FavoritesContext';
import Constants from 'expo-constants';


const PLACES_KEY = Constants.expoConfig?.extra?.googlePlacesKey ?? '';
const RADIO_BUSQUEDA = 999; // metros

interface Coordenadas {
  latitude: number;
  longitude: number;
}


// ── Convierte metros a texto legible ─────────────────────────────────────────
function formatDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}

// ── Calcula distancia entre dos coordenadas (fórmula Haversine) ───────────────
function calcularDistancia(a: Coordenadas, b: Coordenadas): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c =
    2 *
    Math.atan2(
      Math.sqrt(sinDLat * sinDLat + Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) * sinDLon * sinDLon),
      Math.sqrt(1 - sinDLat * sinDLat + Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) * sinDLon * sinDLon)
    );
  return R * c;
}

// ── URL de foto desde Places API ──────────────────────────────────────────────
function getFotoUrl(photoReference: string): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${PLACES_KEY}`;
}

// ── Fetch de restaurantes desde Places API ────────────────────────────────────
async function fetchRestaurantes(
  coords: Coordenadas
): Promise<RestauranteMapa[]> {
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${coords.latitude},${coords.longitude}` +
    `&radius=${RADIO_BUSQUEDA}` +
    `&type=restaurant` +
    `&language=es` +
    `&key=${PLACES_KEY}`;

const res = await fetch(url);
const data = await res.json();

console.log('Places API error:', data.error_message);



  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${data.status}`);
  }

  return (data.results ?? []).map((p: any): RestauranteMapa => {
  const distanciaRaw = calcularDistancia(coords, {
    latitude: p.geometry.location.lat,
    longitude: p.geometry.location.lng,
  });

  return {
    id:            p.place_id,
    nombre:        p.name,
    tipo:          p.types?.includes('restaurant')
      ? (p.types.find((t: string) =>
          !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(t)
        ) ?? 'Restaurante')
      : 'Restaurante',
    distancia:     formatDistancia(distanciaRaw),
    distanciaRaw,                                   
    calificacion:  p.rating ?? 0,
    totalReviews:  p.user_ratings_total ?? 0,
    foto:          p.photos?.[0]?.photo_reference
                     ? getFotoUrl(p.photos[0].photo_reference)
                     : null,
    coordenadas: {
      latitude:  p.geometry.location.lat,
      longitude: p.geometry.location.lng,
    },
    abierto:      p.opening_hours?.open_now ?? null,
    precioNivel:  p.price_level              
      ? ['', '$', '$$', '$$$', '$$$$'][p.price_level] ?? '$$'
      : '$$',
    tiempoEntrega: (() => {                 
      const min = Math.max(10, Math.round(distanciaRaw / 50));
      return `${min}–${min + 10} min`;
    })(),
  };
});
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MapaScreen() {
  const { usuario } = useAuth();
  const mapRef = useRef<MapView>(null);

  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoRestaurantes, setCargandoRestaurantes] = useState(false);
  const [permisoDenegado, setPermisoDenegado] = useState(false);
  const [restaurantes, setRestaurantes] = useState<RestauranteMapa[]>([]);
  const [seleccionado, setSeleccionado] = useState<RestauranteMapa | null>(null);
  const [vistaLista, setVistaLista] = useState(false);

  const { esFavorito, toggleFavorito } = useFavorites();

  useEffect(() => {
    pedirUbicacion();
  }, []);

  const pedirUbicacion = async () => {
    setCargando(true);
    setPermisoDenegado(false);

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setPermisoDenegado(true);
      setCargando(false);
      return;
    }

    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordenadas = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      setUbicacion(coords);
      cargarRestaurantes(coords);

      mapRef.current?.animateToRegion(
        { ...coords, latitudeDelta: 0.012, longitudeDelta: 0.012 },
        800
      );
    } catch {
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const cargarRestaurantes = async (coords: Coordenadas) => {
    setCargandoRestaurantes(true);
    try {
      const data = await fetchRestaurantes(coords);
      setRestaurantes(data);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los restaurantes cercanos.');
    } finally {
      setCargandoRestaurantes(false);
    }
  };

  const centrarEnUsuario = () => {
    if (!ubicacion) return;
    mapRef.current?.animateToRegion(
      { ...ubicacion, latitudeDelta: 0.012, longitudeDelta: 0.012 },
      600
    );
  };

  const comoLlegar = (r: RestauranteMapa) => {
    const { latitude, longitude } = r.coordenadas;
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });
    if (url)
      Linking.openURL(url).catch(() =>
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
        )
      );
  };

  // ── Estado: cargando ubicación ────────────────────────────────────────────
  if (cargando) {
    return (
      <SafeScreen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
        </View>
      </SafeScreen>
    );
  }

  // ── Estado: permiso denegado ──────────────────────────────────────────────
  if (permisoDenegado) {
    return (
      <SafeScreen>
        <View style={styles.centered}>
          <Text style={styles.bigEmoji}>📍</Text>
          <Text style={styles.permTitle}>Ubicación desactivada</Text>
          <Text style={styles.permText}>
            TasteGo necesita tu ubicación para mostrarte restaurantes cercanos.
          </Text>
          <TouchableOpacity style={styles.btnPrimario} onPress={() => Linking.openSettings()}>
            <Text style={styles.btnPrimarioText}>Abrir configuración</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecundario} onPress={pedirUbicacion}>
            <Text style={styles.btnSecundarioText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* Header flotante */}
      <View style={styles.headerFlotante}>
        <View>
          <Text style={styles.headerTitle}>Restaurantes cercanos</Text>
          <Text style={styles.headerSub}>
            {cargandoRestaurantes
              ? 'Buscando...'
              : `Hola, ${usuario?.nombre?.split(' ')[0]} · ${restaurantes.length} lugares`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setVistaLista((v) => !v)}
        >
          <Text style={styles.toggleBtnText}>{vistaLista ? '🗺️' : '☰'}</Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de carga de restaurantes (RF13) */}
      {cargandoRestaurantes && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingBannerText}>Buscando restaurantes...</Text>
        </View>
      )}

      {vistaLista ? (
        /* ── Vista lista ── */
        <FlatList
          data={restaurantes}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={
            !cargandoRestaurantes ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyText}>No encontramos restaurantes cerca</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listaCard}
              onPress={() => { setSeleccionado(item); setVistaLista(false); }}
              activeOpacity={0.85}
            >
              {item.foto ? (
                <Image source={{ uri: item.foto }} style={styles.listaFoto} />
              ) : (
                <View style={[styles.listaFoto, styles.fotoPlaceholder]}>
                  <Text style={{ fontSize: 28 }}>🍽️</Text>
                </View>
              )}
              <View style={styles.listaInfo}>
                <Text style={styles.listaNombre} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.listaTipo} numberOfLines={1}>{item.tipo}</Text>
                <View style={styles.listaRow}>
                  {item.calificacion > 0 && (
                    <Text style={styles.listaTag}>⭐ {item.calificacion}</Text>
                  )}
                  <Text style={styles.listaTag}>📍 {item.distancia}</Text>
                  {item.abierto !== null && (
                    <Text style={[styles.listaTag,
                      { color: item.abierto ? '#22c55e' : '#ef4444' }]}>
                      {item.abierto ? '● Abierto' : '● Cerrado'}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity style={styles.listaRutaBtn} onPress={() => comoLlegar(item)}>
                <Text style={styles.listaRutaIcon}>➤</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        /* ── Vista mapa ── */
        <>
          <MapView
            ref={mapRef}
            style={styles.mapa}
            provider={PROVIDER_GOOGLE}
            showsUserLocation
            showsMyLocationButton={false}
            initialRegion={
              ubicacion
                ? { ...ubicacion, latitudeDelta: 0.012, longitudeDelta: 0.012 }
                : undefined
            }
            onPress={() => setSeleccionado(null)}
          >
            {ubicacion && (
              <Circle
                center={ubicacion}
                radius={RADIO_BUSQUEDA}
                strokeColor={`${Colors.primary}60`}
                fillColor={`${Colors.primary}10`}
                strokeWidth={1.5}
              />
            )}

            {restaurantes.map((r) => (
              <Marker
                key={r.id}
                coordinate={r.coordenadas}
                onPress={() => setSeleccionado(r)}
              >
                <View style={[
                  styles.marcador,
                  seleccionado?.id === r.id && styles.marcadorSeleccionado,
                ]}>
                  <Text style={styles.marcadorEmoji}>🍽️</Text>
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Botón centrar */}
          <TouchableOpacity style={styles.btnCentrar} onPress={centrarEnUsuario}>
            <Text style={styles.btnCentrarIcon}>◎</Text>
          </TouchableOpacity>

          {/* Tarjeta restaurante seleccionado */}
          {seleccionado && (
            <View style={styles.tarjetaContainer}>
              {seleccionado.foto ? (
                <Image source={{ uri: seleccionado.foto }} style={styles.tarjetaFoto} />
              ) : (
                <View style={[styles.tarjetaFoto, styles.fotoPlaceholder]}>
                  <Text style={{ fontSize: 28 }}>🍽️</Text>
                </View>
              )}
              <View style={styles.tarjetaInfo}>
                <Text style={styles.tarjetaNombre} numberOfLines={1}>
                  {seleccionado.nombre}
                </Text>
                <Text style={styles.tarjetaTipo} numberOfLines={1}>
                  {seleccionado.tipo}
                </Text>
                <View style={styles.tarjetaRow}>
                  {seleccionado.calificacion > 0 && (
                    <Text style={styles.tarjetaTag}>⭐ {seleccionado.calificacion}</Text>
                  )}
                  <Text style={styles.tarjetaTag}>📍 {seleccionado.distancia}</Text>
                  {seleccionado.abierto !== null && (
                    <Text style={[styles.tarjetaTag,
                      { color: seleccionado.abierto ? '#22c55e' : '#ef4444' }]}>
                      {seleccionado.abierto ? '● Abierto' : '● Cerrado'}
                    </Text>
                  )}
                </View>
              </View>

              // En la tarjetaContainer, antes del botón "Cómo llegar":
<TouchableOpacity
  onPress={() => toggleFavorito(seleccionado)}
  style={styles.tarjetaFavBtn}
>
  <Text style={{ fontSize: 18 }}>
    {esFavorito(seleccionado.id) ? '❤️' : '🤍'}
  </Text>
</TouchableOpacity>

              <TouchableOpacity
                style={styles.tarjetaBtn}
                onPress={() => comoLlegar(seleccionado)}
              >
                <Text style={styles.tarjetaBtnText}>Cómo llegar</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.horizontalPadding,
    gap: 16,
  },
  loadingText: { fontSize: FontSizes.base, color: Colors.textSecondary, marginTop: 8 },
  bigEmoji: { fontSize: 56 },
  permTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  permText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  btnPrimario: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Layout.radius.lg,
    width: '100%',
    alignItems: 'center',
  },
  btnPrimarioText: { color: '#fff', fontWeight: FontWeights.bold, fontSize: FontSizes.base },
  btnSecundario: { paddingVertical: 12, alignItems: 'center' },
  btnSecundarioText: { color: Colors.primary, fontWeight: FontWeights.medium, fontSize: FontSizes.sm },

  // Header
  headerFlotante: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.horizontalPadding,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  toggleBtn: {
    width: 40, height: 40,
    borderRadius: Layout.radius.full,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  toggleBtnText: { fontSize: 18 },

  // Loading banner (RF13)
  loadingBanner: {
    position: 'absolute',
    top: 105,
    alignSelf: 'center',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Layout.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingBannerText: { fontSize: FontSizes.xs, color: Colors.textSecondary },

  // Mapa
  mapa: { flex: 1, marginTop: 100 },

  // Marcadores
  marcador: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  marcadorSeleccionado: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
    transform: [{ scale: 1.2 }],
  },
  marcadorEmoji: { fontSize: 20 },

  // Botón centrar
  btnCentrar: {
    position: 'absolute',
    bottom: 220, right: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 4,
  },
  btnCentrarIcon: { fontSize: 22, color: Colors.primary },

  // Tarjeta seleccionado
  tarjetaContainer: {
    position: 'absolute',
    bottom: 100, left: 16, right: 16,
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.xl,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  tarjetaFoto: {
    width: 64, height: 64,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.backgroundAlt,
  },
  fotoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  tarjetaInfo: { flex: 1, gap: 3 },
  tarjetaNombre: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  tarjetaTipo: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  tarjetaRow: { flexDirection: 'row', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  tarjetaTag: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  tarjetaBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: Layout.radius.md, alignItems: 'center',
  },
  tarjetaBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: FontWeights.bold },

  // Lista
  listaContainer: {
    paddingTop: 110,
    paddingHorizontal: Layout.horizontalPadding,
    paddingBottom: 100,
    gap: 12,
  },
  listaCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.xl,
    padding: 12, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  listaFoto: {
    width: 72, height: 72,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.backgroundAlt,
  },
  listaInfo: { flex: 1, gap: 4 },
  listaNombre: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  listaTipo: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  listaRow: { flexDirection: 'row', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  listaTag: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  listaRutaBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  listaRutaIcon: { color: '#fff', fontSize: 16, fontWeight: FontWeights.bold },

  // Empty state
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: FontSizes.base, color: Colors.textSecondary, textAlign: 'center' },

  tarjetaFavBtn: {
  width: 36, height: 36, borderRadius: 18,
  backgroundColor: Colors.backgroundAlt,
  alignItems: 'center', justifyContent: 'center',
  borderWidth: 1, borderColor: Colors.border,
},
});