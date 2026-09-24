/** Configuración de desarrollo (`ng serve`). */
export const environment = {
  produccion: false,
  /** Las peticiones a /api se redirigen a Spring Boot (localhost:8080) con proxy.conf.json. */
  apiUrl: '/api',
  /** Mientras no exista el backend se trabaja con datos de ejemplo. Cambiar a false para usar la API. */
  usarDatosEjemplo: true,
};
