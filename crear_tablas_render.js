/**
 * Script para crear tablas en la BD de Render (gratuita)
 * Ejecutar: node crear_tablas_render.js
 */

require('dotenv').config();
const pool = require('./config/db');

async function crearTablas() {
  console.log('=== Creando tablas en BD de Render ===');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : 'FALTA');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no configurada.');
    process.exit(1);
  }

  try {
    // Crear tabla users
    console.log('📝 Creando tabla users...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'usuario',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Crear tabla products
    console.log('📦 Creando tabla products...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        artista VARCHAR(255),
        genero VARCHAR(100),
        anio INTEGER,
        num_canciones INTEGER,
        info_relevante TEXT,
        precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
        imagen VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Crear tabla cart
    console.log('🛒 Creando tabla cart...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      )
    `);

    // Crear tabla orders
    console.log('📋 Creando tabla orders...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
        fecha TIMESTAMP DEFAULT NOW(),
        stripe_payment_intent VARCHAR(255)
      )
    `);

    // Crear tabla order_items
    console.log('📦 Creando tabla order_items...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario > 0)
      )
    `);

    console.log('✅ Tablas creadas correctamente.');
    await pool.end();
    console.log('\n🎉 Base de datos lista para usar.');
  } catch (err) {
    console.error('❌ Error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      where: err.where,
      stack: err.stack,
    });
    await pool.end();
    process.exit(1);
  }
}

crearTablas();
