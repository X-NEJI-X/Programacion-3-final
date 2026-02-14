/**
 * Configuración del pool de conexiones a PostgreSQL.
 * Compatible con Render: usa process.env.DATABASE_URL
 */

const { Pool } = require('pg');

// Si no hay DATABASE_URL, crear un pool mock que siempre falle
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
}) : null;

// Verificar conexión al iniciar (solo si hay pool real)
if (pool) {
  pool.on('connect', (client) => {
    console.log('Conexión a PostgreSQL establecida.');
  });

  pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
  });
}

// Log para depuración
console.log('DATABASE_URL configurada:', process.env.DATABASE_URL ? 'OK' : 'FALTA');

module.exports = pool;
