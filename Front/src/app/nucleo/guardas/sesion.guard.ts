import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CONFIGURACION_APP } from '../configuracion/configuracion-app';
import { SesionService } from '../servicios/sesion.service';

/** Solo deja entrar al panel si hay sesión. Con datos de ejemplo no se exige. */
export const sesionGuard: CanActivateFn = () => {
  if (inject(CONFIGURACION_APP).usarDatosEjemplo || inject(SesionService).haySesion()) return true;
  return inject(Router).createUrlTree(['/login']);
};
