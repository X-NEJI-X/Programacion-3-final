/**
 * Configuración de la aplicación
 * Permite alternar entre datos locales y API
 */

// Cambiar a true para usar API, false para usar datos locales
const USE_API = false;

// URL base para la API (solo se usa si USE_API es true)
const API_BASE = window.location.origin + '/api';

// Configuración de desarrollo/producción
const IS_PRODUCTION = window.location.hostname !== 'localhost';

module.exports = {
  USE_API,
  API_BASE,
  IS_PRODUCTION
};
