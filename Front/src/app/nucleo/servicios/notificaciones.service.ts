import { Injectable, signal } from '@angular/core';

/** Mensajes globales para el usuario (p. ej. errores de conexión con el backend). */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  readonly error = signal<string | null>(null);

  mostrarError(mensaje: string) {
    this.error.set(mensaje);
  }

  limpiar() {
    this.error.set(null);
  }
}
