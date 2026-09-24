import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { SesionService } from '../servicios/sesion.service';

/**
 * Traduce los errores HTTP a mensajes para el usuario.
 * Se espera que el backend responda los errores como { "mensaje": "..." }.
 */
export const erroresHttpInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const notificaciones = inject(NotificacionesService);
  const sesion = inject(SesionService);
  const router = inject(Router);

  return siguiente(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !peticion.url.includes('/autenticacion/')) {
        sesion.cerrar();
        router.navigate(['/login']);
      }
      notificaciones.mostrarError(mensajeDeError(error));
      return throwError(() => error);
    }),
  );
};

export function mensajeDeError(error: HttpErrorResponse): string {
  if (error.error?.mensaje) return error.error.mensaje;
  switch (error.status) {
    case 0: return 'No hay conexión con el servidor. Revisa que el backend esté encendido.';
    case 401: return 'Tu sesión terminó. Inicia sesión de nuevo.';
    case 403: return 'No tienes permiso para hacer esta acción.';
    case 404: return 'No se encontró el recurso solicitado.';
    default: return 'Ocurrió un error en el servidor. Intenta de nuevo.';
  }
}
