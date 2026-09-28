import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ConfiguracionApp {
  /** URL base del backend, p. ej. '/api'. */
  apiUrl: string;
  /** true = datos de ejemplo en memoria, sin llamar al backend. */
  usarDatosEjemplo: boolean;
}

/**
 * Configuración de la app. Por defecto viene de `environments/`; las pruebas
 * pueden reemplazarla con `{ provide: CONFIGURACION_APP, useValue: ... }`.
 */
export const CONFIGURACION_APP = new InjectionToken<ConfiguracionApp>('CONFIGURACION_APP', {
  providedIn: 'root',
  factory: () => ({ apiUrl: environment.apiUrl, usarDatosEjemplo: environment.usarDatosEjemplo }),
});
