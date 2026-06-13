// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '@/src/services/authService';

const STORAGE_KEY_USUARIO = 'tastego_usuario';
const prefKey = (id: number)   => `tastego_preferencias_${id}`;

interface AuthContextType {
  usuario:        Usuario | null;
  preferencias:   string[];                         
  isNewUser:      boolean;          
  setUsuario:     (u: Usuario | null) => Promise<void>;
  setPreferencias:(prefs: string[]) => Promise<void>; 
  setIsNewUser:   (v: boolean) => void;  
  logout:         () => Promise<void>;
  isLoading:      boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuarioState] = useState<Usuario | null>(null);
  const [preferencias, setPreferenciasState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Al arrancar, recuperar sesión guardada
useEffect(() => {
  AsyncStorage.getItem(STORAGE_KEY_USUARIO).then(async (jsonUsuario) => {
    if (jsonUsuario) {
      const u: Usuario = JSON.parse(jsonUsuario);
      setUsuarioState(u);
      // Carga las preferencias de ESE usuario
      const jsonPrefs = await AsyncStorage.getItem(prefKey(u.id_usuario));
      if (jsonPrefs) setPreferenciasState(JSON.parse(jsonPrefs));
    }
  }).finally(() => setIsLoading(false));
}, []);

const setUsuario = async (u: Usuario | null) => {
  setUsuarioState(u);
  if (u) {
    await AsyncStorage.setItem(STORAGE_KEY_USUARIO, JSON.stringify(u));
    // Cargar preferencias de este usuario al hacer login
    const jsonPrefs = await AsyncStorage.getItem(prefKey(u.id_usuario));
    setPreferenciasState(jsonPrefs ? JSON.parse(jsonPrefs) : []);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY_USUARIO);
    setPreferenciasState([]); // limpiar al hacer logout
  }
};

const setPreferencias = async (prefs: string[]) => {
  if (!usuario) return;
  setPreferenciasState(prefs);
  await AsyncStorage.setItem(prefKey(usuario.id_usuario), JSON.stringify(prefs));
};

// Reemplaza logout:
const logout = async () => {
  await setUsuario(null);
  setPreferenciasState([]); // limpia memoria pero NO borra AsyncStorage
                            // así cuando vuelva a loguearse con ese usuario
                            // las preferencias siguen ahí
};
  return (
    <AuthContext.Provider value={{
  usuario, preferencias, isNewUser,
  setUsuario, setPreferencias, setIsNewUser,
  logout, isLoading,
}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}