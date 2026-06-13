// src/context/RestaurantesContext.tsx
import React, {
  createContext, useContext, useState,
  useEffect, useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import type { RestauranteMapa } from '@/src/types/restaurant';
import { useAuth } from '@/src/context/AuthContext';
import Constants from 'expo-constants';

const PLACES_KEY = Constants.expoConfig?.extra?.googlePlacesKey ?? '';
const RADIO        = 5000; // 5 km para Home (más amplio que el mapa)
const cacheKey     = (id: number) => `tastego_restaurantes_${id}`;

// ── Helpers (mismos de mapa.tsx) ─────────────────────────────────────────────
function formatDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}

function calcularDistancia(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371000;
  const dLat = ((b.latitude  - a.latitude)  * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c = 2 * Math.atan2(
    Math.sqrt(sinDLat * sinDLat +
      Math.cos((a.latitude  * Math.PI) / 180) *
      Math.cos((b.latitude  * Math.PI) / 180) *
      sinDLon * sinDLon),
    Math.sqrt(1 - sinDLat * sinDLat -
      Math.cos((a.latitude  * Math.PI) / 180) *
      Math.cos((b.latitude  * Math.PI) / 180) *
      sinDLon * sinDLon)
  );
  return R * c;
}

function getFotoUrl(ref: string): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ref}&key=${PLACES_KEY}`;
}

function mapPrecio(level?: number): string {
  return ['', '$', '$$', '$$$', '$$$$'][level ?? 0] ?? '$$';
}

function estimarTiempo(metros: number): string {
  const min = Math.max(10, Math.round(metros / 50));
  return `${min}–${min + 10} min`;
}

async function fetchDesdePlaces(
  coords: { latitude: number; longitude: number }
): Promise<RestauranteMapa[]> {
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${coords.latitude},${coords.longitude}` +
    `&radius=${RADIO}` +
    `&type=restaurant` +
    `&language=es` +
    `&key=${PLACES_KEY}`;

  const res  = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS')
    throw new Error(`Places API: ${data.status}`);

  return (data.results ?? []).map((p: any): RestauranteMapa => {
    const distanciaRaw = calcularDistancia(coords, {
      latitude:  p.geometry.location.lat,
      longitude: p.geometry.location.lng,
    });
    return {
      id:            p.place_id,
      nombre:        p.name,
      tipo:          (() => {
        const skip = new Set(['restaurant','food','point_of_interest','establishment']);
        return p.types?.find((t: string) => !skip.has(t)) ?? 'Restaurante';
      })(),
      distancia:     formatDistancia(distanciaRaw),
      distanciaRaw,
      calificacion:  p.rating ?? 0,
      totalReviews:  p.user_ratings_total ?? 0,
      foto:          p.photos?.[0]?.photo_reference
                       ? getFotoUrl(p.photos[0].photo_reference)
                       : null,
      coordenadas:   { latitude: p.geometry.location.lat, longitude: p.geometry.location.lng },
      abierto:       p.opening_hours?.open_now ?? null,
      precioNivel:   mapPrecio(p.price_level),
      tiempoEntrega: estimarTiempo(distanciaRaw),
    };
  });
}

// ── Contexto ─────────────────────────────────────────────────────────────────
interface RestaurantesContextType {
  restaurantes:  RestauranteMapa[];
  cargando:      boolean;
  error:         string | null;
  recargar:      () => Promise<void>;
  permisoDenegado: boolean;
}

const RestaurantesContext = createContext<RestaurantesContextType | null>(null);

export function RestaurantesProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const [restaurantes,     setRestaurantes]     = useState<RestauranteMapa[]>([]);
  const [cargando,         setCargando]         = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [permisoDenegado,  setPermisoDenegado]  = useState(false);

  // Al cambiar de usuario: carga su caché o hace fetch nuevo
  useEffect(() => {
    setRestaurantes([]);
    if (!usuario) return;
    cargar(usuario.id_usuario);
  }, [usuario?.id_usuario]);

  const cargar = async (userId: number) => {
    setCargando(true);
    setError(null);
    setPermisoDenegado(false);

    try {
      // 1. ¿Hay caché para este usuario?
      const raw = await AsyncStorage.getItem(cacheKey(userId));
      if (raw) {
        setRestaurantes(JSON.parse(raw));
        setCargando(false);
        return; // usa caché, no llama a la API
      }

      // 2. No hay caché → pedir GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermisoDenegado(true);
        setCargando(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 3. Llamar a Places API
      const data = await fetchDesdePlaces({
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      // 4. Guardar en caché
      await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(data));
      setRestaurantes(data);
    } catch (e: any) {
      setError(e.message ?? 'Error cargando restaurantes');
    } finally {
      setCargando(false);
    }
  };

  // Forzar recarga (rompe caché)
  const recargar = useCallback(async () => {
    if (!usuario) return;
    await AsyncStorage.removeItem(cacheKey(usuario.id_usuario));
    await cargar(usuario.id_usuario);
  }, [usuario]);

  return (
    <RestaurantesContext.Provider
      value={{ restaurantes, cargando, error, recargar, permisoDenegado }}
    >
      {children}
    </RestaurantesContext.Provider>
  );
}

export function useRestaurantes() {
  const ctx = useContext(RestaurantesContext);
  if (!ctx) throw new Error('useRestaurantes debe usarse dentro de RestaurantesProvider');
  return ctx;
}

// Exporta también la función de borrar caché para usarla en logout
export const borrarCacheRestaurantes = async (userId: number) => {
  await AsyncStorage.removeItem(cacheKey(userId));
};