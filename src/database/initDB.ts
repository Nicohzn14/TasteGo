
/**
 * initDB.ts — Inicialización de todas las tablas de la base de datos.
 *
 * Este archivo se llama UNA SOLA VEZ al arrancar la app (en _layout.tsx raíz).
 * Usa IF NOT EXISTS en cada tabla → es seguro llamarlo múltiples veces sin
 * destruir datos existentes.
 */

import { getDB } from './bd';

// ─────────────────────────────────────────────────────────────────────────────
// DDL: Definición de todas las tablas
// ─────────────────────────────────────────────────────────────────────────────

const CREATE_TABLES_SQL = `
   -- 1. Usuarios
  CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario      INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT    NOT NULL,
    email           TEXT    UNIQUE NOT NULL,
    password        TEXT    NOT NULL,
    telefono        TEXT,
    fecha_nacimiento TEXT,
    fecha_registro  TEXT    DEFAULT (datetime('now', 'localtime'))
  );

  -- 2. Categorías de comida (referenciada por otras tablas)
  CREATE TABLE IF NOT EXISTS categoria (
    id_categoria  INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT NOT NULL,
    descripcion   TEXT
  );

  -- 3. Preferencias del usuario
  CREATE TABLE IF NOT EXISTS preferencias (
    id_preferencia      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario          INTEGER NOT NULL,
    tipo_comida         TEXT    NOT NULL,
    fecha_actualizacion TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
  );

  -- 4. Restaurantes
  CREATE TABLE IF NOT EXISTS restaurantes (
    id_restaurante  INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT  NOT NULL,
    descripcion     TEXT,
    tipo_comida     TEXT,
    direccion       TEXT,
    ciudad          TEXT,
    latitud         REAL,
    longitud        REAL,
    imagen_url      TEXT,
    telefono        TEXT,
    horario         TEXT,
    calificacion    REAL,
    fuente          TEXT DEFAULT 'local',
    fecha_creacion  TEXT DEFAULT (datetime('now', 'localtime'))
  );

  -- 5. Platos del menú
  CREATE TABLE IF NOT EXISTS platos (
    id_plato        INTEGER PRIMARY KEY AUTOINCREMENT,
    id_restaurante  INTEGER NOT NULL,
    id_categoria    INTEGER NOT NULL,
    nombre          TEXT    NOT NULL,
    descripcion     TEXT,
    precio          REAL,
    imagen_url      TEXT,
    modelo_3d_url   TEXT,
    disponible      INTEGER DEFAULT 1,
    FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria)   REFERENCES categoria(id_categoria)      ON DELETE CASCADE
  );

  -- 6. Favoritos
  CREATE TABLE IF NOT EXISTS favoritos (
    id_favorito     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario      INTEGER NOT NULL,
    id_restaurante  INTEGER NOT NULL,
    fecha_guardado  TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (id_usuario)     REFERENCES usuarios(id_usuario)         ON DELETE CASCADE,
    FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante) ON DELETE CASCADE,
    UNIQUE (id_usuario, id_restaurante)
  );

  -- 7. Historial de búsquedas
  CREATE TABLE IF NOT EXISTS historial_busquedas (
    id_busqueda   INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario    INTEGER,
    id_categoria  INTEGER,
    tipo_comida   TEXT,
    ciudad        TEXT,
    latitud       REAL,
    longitud      REAL,
    fecha_busqueda TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (id_usuario)   REFERENCES usuarios(id_usuario)       ON DELETE SET NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)    ON DELETE SET NULL
  );

  -- 8. Rutas consultadas
  CREATE TABLE IF NOT EXISTS rutas (
    id_ruta             INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario          INTEGER,
    id_restaurante      INTEGER NOT NULL,
    origen_latitud      REAL,
    origen_longitud     REAL,
    destino_latitud     REAL,
    destino_longitud    REAL,
    distancia_texto     TEXT,
    duracion_texto      TEXT,
    medio_desplazamiento TEXT,
    fecha_consulta      TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (id_usuario)     REFERENCES usuarios(id_usuario)         ON DELETE SET NULL,
    FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante) ON DELETE CASCADE
  );

  -- 9. Reviews de platos/restaurantes
  CREATE TABLE IF NOT EXISTS review (
    id_review       INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plato        INTEGER NOT NULL,
    id_restaurante  INTEGER NOT NULL,
    id_usuario      INTEGER NOT NULL,
    descripcion     TEXT,
    FOREIGN KEY (id_plato)       REFERENCES platos(id_plato)              ON DELETE CASCADE,
    FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante)  ON DELETE CASCADE,
    FOREIGN KEY (id_usuario)     REFERENCES usuarios(id_usuario)          ON DELETE CASCADE
  );
`;

const MIGRATIONS_SQL = [
  `ALTER TABLE usuarios ADD COLUMN telefono TEXT;`,
  `ALTER TABLE usuarios ADD COLUMN fecha_nacimiento TEXT;`,
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed: datos iniciales opcionales
// ─────────────────────────────────────────────────────────────────────────────

const SEED_CATEGORIAS_SQL = `
  INSERT OR IGNORE INTO categoria (id_categoria, nombre, descripcion) VALUES
    (1, 'Típica',   'Comida tradicional colombiana'),
    (2, 'Rápida',   'Hamburguesas, pizzas, perros calientes'),
    (3, 'Gourmet',  'Alta gastronomía y cocina de autor'),
    (4, 'Saludable','Ensaladas, bowls y opciones fit'),
    (5, 'Mariscos', 'Pescados y frutos de mar');
`;

// ─────────────────────────────────────────────────────────────────────────────
// Función principal de inicialización
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea todas las tablas y carga datos iniciales.
 * Llama esta función en el _layout.tsx raíz, antes de renderizar la app.
 *
 * Ejemplo en app/_layout.tsx:
 *   useEffect(() => { initDB(); }, []);
 */
export async function initDB(): Promise<void> {
  try {
    const db = await getDB();
    await db.execAsync(CREATE_TABLES_SQL);

    // Migraciones seguras (ignoran error si la columna ya existe)
    for (const sql of MIGRATIONS_SQL) {
      try {
        await db.execAsync(sql);
      } catch (_) {
        // Columna ya existe, ok
      }
    }

    await db.execAsync(SEED_CATEGORIAS_SQL);
    console.log('[DB] Base de datos inicializada correctamente ✓');
  } catch (error) {
    console.error('[DB] Error inicializando la base de datos:', error);
    throw error;
  }
}