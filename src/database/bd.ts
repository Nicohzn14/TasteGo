/**
 * db.ts — Conexión única (singleton) a la base de datos SQLite.
 *
 * Por qué singleton: expo-sqlite abre el archivo físico en disco.
 * Abrir múltiples instancias puede generar bloqueos o corrupción.
 * Con este patrón garantizamos una sola conexión reutilizada en toda la app.
 */

import * as SQLite from 'expo-sqlite';

// Nombre del archivo .db que se crea en el almacenamiento del dispositivo
const DB_NAME = 'tastego.db';

// Variable privada que guarda la única instancia
let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Devuelve la conexión a la base de datos.
 * Si aún no existe, la abre (o crea) y la almacena.
c/database/db';

 */
export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  // openDatabaseAsync crea el archivo si no existe
  _db = await SQLite.openDatabaseAsync(DB_NAME);

  // WAL (Write-Ahead Logging) mejora el rendimiento en lecturas/escrituras concurrentes
  await _db.execAsync('PRAGMA journal_mode = WAL;');

  // Activa integridad referencial (las FOREIGN KEY del schema no funcionan sin esto)
  await _db.execAsync('PRAGMA foreign_keys = ON;');

  return _db;
}

/**
 * Cierra la conexión y limpia la instancia.
 * Útil en tests o si necesitas resetear la DB en desarrollo.
 */
export async function closeDB(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}