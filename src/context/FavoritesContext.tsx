// src/context/FavoritesContext.tsx
import React, {
  createContext, useContext, useState,
  useEffect, useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RestauranteMapa } from '@/src/types/restaurant';
import { useAuth } from '@/src/context/AuthContext';

const storageKey = (id: number) => `tastego_favoritos_${id}`;

interface FavoritesContextType {
  favoritos:      RestauranteMapa[];
  esFavorito:     (id: string) => boolean;
  toggleFavorito: (r: RestauranteMapa) => Promise<void>;
  quitarFavorito: (id: string) => Promise<void>;
  cargando:       boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const [favoritos, setFavoritos] = useState<RestauranteMapa[]>([]);
  const [cargando,  setCargando]  = useState(true);

  // Cada vez que cambia el usuario, carga SUS favoritos
  useEffect(() => {
    setFavoritos([]);
    if (!usuario) { setCargando(false); return; }

    setCargando(true);
    AsyncStorage.getItem(storageKey(usuario.id_usuario))
      .then((raw) => { if (raw) setFavoritos(JSON.parse(raw)); })
      .finally(() => setCargando(false));
  }, [usuario?.id_usuario]);

  const persistir = async (lista: RestauranteMapa[]) => {
    if (!usuario) return;
    await AsyncStorage.setItem(storageKey(usuario.id_usuario), JSON.stringify(lista));
  };

  const esFavorito = useCallback(
    (id: string) => favoritos.some((f) => f.id === id),
    [favoritos]
  );

  const toggleFavorito = async (r: RestauranteMapa) => {
    const siguiente = esFavorito(r.id)
      ? favoritos.filter((f) => f.id !== r.id)
      : [...favoritos, r];
    setFavoritos(siguiente);
    await persistir(siguiente);
  };

  const quitarFavorito = async (id: string) => {
    const siguiente = favoritos.filter((f) => f.id !== id);
    setFavoritos(siguiente);
    await persistir(siguiente);
  };

  return (
    <FavoritesContext.Provider
      value={{ favoritos, esFavorito, toggleFavorito, quitarFavorito, cargando }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return ctx;
}