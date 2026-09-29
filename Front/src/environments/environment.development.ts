/** Configuración de desarrollo (`ng serve`). */
export const environment = {
  produccion: false,
  /** Las peticiones a /api se redirigen al backend de Render con proxy.conf.json (local: npm run start:local). */
  apiUrl: '/api',
  /** true = trabajar sin backend, con datos de ejemplo en memoria. */
  usarDatosEjemplo: false,
};
