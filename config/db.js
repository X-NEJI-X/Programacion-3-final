/**
 * Configuración del pool de conexiones a PostgreSQL.
 * Compatible con Render: usa process.env.DATABASE_URL
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

// Verificar conexión al iniciar
pool.on('connect', (client) => {
  console.log('Conexión a PostgreSQL establecida.');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

// Validación temprana de DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('⚠️ DATABASE_URL no está definida. La app funcionará pero las operaciones de BD fallarán.');
  // No detener la app, solo advertir
}

// Log para depuración
console.log('DATABASE_URL configurada:', process.env.DATABASE_URL ? 'OK' : 'FALTA');

module.exports = pool;
