/**
 * Seed idempotente para Render Free: inserta productos solo si la tabla está vacía.
 * Se ejecuta automáticamente al iniciar la app en producción si se llama desde app.js.
 */

require('dotenv').config();
const pool = require('./config/db');

async function seedIfNeeded() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Seed: no es producción, omitiendo inserción automática.');
    return;
  }

  // Verificar que DATABASE_URL exista y sea válida
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ Seed: DATABASE_URL no configurada, omitiendo inserción.');
    return;
  }

  try {
    // Testear conexión básica con timeout
    const result = await Promise.race([
      pool.query('SELECT 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout BD')), 5000))
    ]);
    console.log('✅ Seed: conexión a BD exitosa.');
    
    // Verificar si ya hay productos
    const countResult = await pool.query('SELECT COUNT(*) as total FROM products');
    const total = parseInt(countResult.rows[0].total, 10);
    
    if (total > 0) {
      console.log(`📦 Seed: ya existen ${total} productos, omitiendo inserción.`);
      return;
    }

    console.log('🌱 Seed: tabla vacía, insertando productos iniciales...');
    
    // Productos básicos (reducidos para no sobrecargar memoria)
    const productos = [
      { codigo: 'PRD001', nombre: 'The Prodigy Experience', artista: 'The Prodigy', genero: 'Electrónica', anio: 1992, num_canciones: 12, info_relevante: 'Portada con fondo negro y cara con rayos láser de colores', precio: 28.99, imagen: '/images/albums/R-26193-1313909388.jpg' },
      { codigo: 'PRD002', nombre: 'The Fat of the Land', artista: 'The Prodigy', genero: 'Electrónica', anio: 1997, num_canciones: 10, info_relevante: 'Fondo negro con cangrejo rojo/anaranjado', precio: 29.99, imagen: '/images/albums/R-26194-1592430767-5429.jpg' },
      { codigo: 'NWA001', nombre: 'Straight Outta Compton', artista: 'N.W.A', genero: 'Hip-Hop', anio: 1988, num_canciones: 13, info_relevante: 'Fondo negro con letras N.W.A en rojo y graffiti', precio: 32.99, imagen: '/images/albums/R-103648-1642412832-5480.jpg' },
      { codigo: 'EMM001', nombre: 'The Eminem Show', artista: 'Eminem', genero: 'Hip-Hop', anio: 2002, num_canciones: 20, info_relevante: 'Fondo gris con cortina de teatro y Eminem en escenario', precio: 31.99, imagen: '/images/albums/R-176346-1571810543-9832.jpg' },
      { codigo: 'TUP001', nombre: 'All Eyez on Me', artista: '2Pac', genero: 'Hip-Hop', anio: 1996, num_canciones: 27, info_relevante: '2Pac con torso desnudo, tatuajes y fondo púrpura', precio: 35.99, imagen: '/images/albums/R-238369-1650818330-8599.jpg' },
      { codigo: 'PNT001', nombre: 'Cowboys from Hell', artista: 'Pantera', genero: 'Heavy Metal', anio: 1990, num_canciones: 12, info_relevante: 'Vaquero esqueleto montando caballo con alas', precio: 31.99, imagen: '/images/albums/R-367301-1610560614-8573.jpg' },
      { codigo: 'RAT001', nombre: 'Rage Against the Machine', artista: 'Rage Against the Machine', genero: 'Rock', anio: 1992, num_canciones: 12, info_relevante: 'Monje budista quemándose', precio: 29.99, imagen: '/images/albums/R-367339-1615037762-7659.jpg' },
      { codigo: 'LP001', nombre: 'Hybrid Theory', artista: 'Linkin Park', genero: 'Nu Metal', anio: 2000, num_canciones: 12, info_relevante: 'Soldado con alas de libélula', precio: 33.99, imagen: '/images/albums/R-369408-1245380540.jpg' },
      { codigo: 'MTL001', nombre: 'Ride the Lightning', artista: 'Metallica', genero: 'Thrash Metal', anio: 1984, num_canciones: 8, info_relevante: 'Portada con silla eléctrica y rayos', precio: 30.99, imagen: '/images/albums/R-377464-1753530613-1176.jpg' },
      { codigo: 'NV001', nombre: 'In Utero', artista: 'Nirvana', genero: 'Grunge', anio: 1993, num_canciones: 12, info_relevante: 'Ángel anatómico con alas', precio: 31.99, imagen: '/images/albums/R-375979-1491700347-7263.jpg' }
    ];

    for (const producto of productos) {
      await pool.query(
        `INSERT INTO products (codigo, nombre, artista, genero, anio, num_canciones, info_relevante, precio, imagen, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (codigo) DO NOTHING`,
        [producto.codigo, producto.nombre, producto.artista, producto.genero, producto.anio, producto.num_canciones, producto.info_relevante, producto.precio, producto.imagen]
      );
    }

    const finalCount = await pool.query('SELECT COUNT(*) as total FROM products');
    console.log(`✅ Seed completado: ${finalCount.rows[0].total} productos insertados.`);
  } catch (err) {
    console.error('❌ Error en seed:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
    });
    // No detener la app si el seed falla
  }
}

module.exports = { seedIfNeeded };
