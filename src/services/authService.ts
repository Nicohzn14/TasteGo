/**
 * authService.ts — Lógica de autenticación con SQLite.

 */

import * as Crypto from 'expo-crypto';
import { getDB } from '../database/bd';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface Usuario {
  id_usuario:       number;
  nombre:           string;
  email:            string;
  telefono?:        string;
  fecha_nacimiento?: string;
  fecha_registro:   string;
}
export interface AuthResult {
  success: boolean;
  usuario?: Usuario;
  error?:   string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers privados
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hashea una contraseña con SHA-256.
 * Al ser determinístico, el mismo password siempre produce el mismo hash,
 * lo que permite comparar en login sin guardar la contraseña en texto plano.
 */
async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

/**
 * Validaciones básicas reutilizables.
 * Devuelve un mensaje de error o null si todo está bien.
 */
function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim())            return 'El correo es obligatorio.';
  if (!emailRegex.test(email))  return 'El formato del correo no es válido.';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password)          return 'La contraseña es obligatoria.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Función: login
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Autentica un usuario verificando email + contraseña contra la BD.

 */
export async function login(email: string, password: string): Promise<AuthResult> {
  // 1. Validaciones de formato antes de tocar la BD
  const emailError = validateEmail(email);
  if (emailError) return { success: false, error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { success: false, error: passwordError };

  try {
    const db = await getDB();
    const hashedPassword = await hashPassword(password.trim());

    // 2. Buscar usuario por email Y password hasheada
    //    getFirstAsync devuelve la primera fila o null (nunca lanza si no hay resultados)
    const usuario = await db.getFirstAsync<Usuario>(
      `SELECT id_usuario, nombre, email, fecha_registro, telefono, fecha_nacimiento
       FROM usuarios
       WHERE email = ? AND password = ?`,
      [email.trim().toLowerCase(), hashedPassword]
    );

    if (!usuario) {
      // No distinguimos "email no existe" de "password incorrecta" por seguridad
      return {
        success: false,
        error: 'Correo o contraseña incorrectos.',
      };
    }

    return { success: true, usuario };

  } catch (error) {
    console.error('[AuthService] Error en login:', error);
    return {
      success: false,
      error: 'Error interno. Intenta de nuevo.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Función: register
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo usuario en la base de datos.
 *

 */
export async function register(
  nombre:           string,
  email:            string,
  password:         string,
  confirmPassword?: string,
  telefono?:        string,
  fecha_nacimiento?: string,
): Promise<AuthResult> {
  // ... validaciones igual ...

  // 1. Validaciones de formato
  if (!nombre.trim()) {
    return { success: false, error: 'El nombre es obligatorio.' };
  }

  const emailError = validateEmail(email);
  if (emailError) return { success: false, error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { success: false, error: passwordError };

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { success: false, error: 'Las contraseñas no coinciden.' };
  }

  try {
    const db = await getDB();
    const hashedPassword = await hashPassword(password.trim());
    const emailNormalizado = email.trim().toLowerCase();

    // 2. Verificar si el email ya está registrado
    //    (aunque la BD tiene UNIQUE, es mejor dar un mensaje claro)
    const existing = await db.getFirstAsync<{ id_usuario: number }>(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [emailNormalizado]
    );

    if (existing) {
      return {
        success: false,
        error: 'Este correo ya está registrado. ¿Olvidaste tu contraseña?',
      };
    }

    // 3. Insertar el nuevo usuario
    const result = await db.runAsync(
    `INSERT INTO usuarios (nombre, email, password, telefono, fecha_nacimiento)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre.trim(), emailNormalizado, hashedPassword,
     telefono?.trim() ?? null, fecha_nacimiento ?? null]
  );

    // runAsync devuelve { lastInsertRowId, changes }
    const nuevoUsuario: Usuario = {
    id_usuario:       result.lastInsertRowId,
    nombre:           nombre.trim(),
    email:            emailNormalizado,
    telefono:         telefono?.trim(),
    fecha_nacimiento: fecha_nacimiento,
    fecha_registro:   new Date().toISOString(),
  };

    return { success: true, usuario: nuevoUsuario };

  } catch (error) {
    console.error('[AuthService] Error en register:', error);
    return {
      success: false,
      error: 'No se pudo crear la cuenta. Intenta de nuevo.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Función: getUserById (bonus — útil para recuperar sesión guardada)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recupera un usuario por su ID.
 * Útil si guardas el id_usuario en AsyncStorage para sesión persistente.
 */
export async function getUserById(id: number): Promise<Usuario | null> {
  try {
    const db = await getDB();
    return await db.getFirstAsync<Usuario>(
      'SELECT id_usuario, nombre, email, fecha_registro, telefono, fecha_nacimiento FROM usuarios WHERE id_usuario = ?',
      [id]
    );
  } catch (error) {
    console.error('[AuthService] Error en getUserById:', error);
    return null;
  }
}