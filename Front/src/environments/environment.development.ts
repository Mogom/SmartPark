/** Configuración de desarrollo (`ng serve`). */
export const environment = {
  produccion: false,
  /** Las peticiones a /api se redirigen al backend local (localhost:8080) con proxy.conf.json. */
  apiUrl: '/api',
  /** true = trabajar sin backend, con datos de ejemplo en memoria. */
  usarDatosEjemplo: false,
};
