/** Configuración de producción. */
export const environment = {
  produccion: true,
  /** URL base del backend desplegado (Spring Boot). */
  apiUrl: 'https://smartpark-fzas.onrender.com/api/v1',
  /** true = la app usa datos de ejemplo en memoria y no llama al backend. */
  usarDatosEjemplo: false,
};
