/**
 * Manejador de error para suscripciones cuyo error ya muestra el interceptor de errores HTTP.
 * Evita que RxJS lo reporte como error no manejado.
 */
export const errorYaNotificado = () => undefined;
