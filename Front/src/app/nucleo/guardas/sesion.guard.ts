import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SesionService } from '../servicios/sesion.service';

/** Solo deja entrar al panel si hay sesión. Con datos de ejemplo no se exige. */
export const sesionGuard: CanActivateFn = () => {
  if (environment.usarDatosEjemplo || inject(SesionService).haySesion()) return true;
  return inject(Router).createUrlTree(['/login']);
};
