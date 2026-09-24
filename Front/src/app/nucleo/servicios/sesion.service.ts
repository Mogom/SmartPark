import { Injectable, computed, signal } from '@angular/core';
import { RespuestaLogin, Usuario } from '../modelos';

const CLAVE_SESION = 'smartpark.sesion';

interface DatosSesion {
  token: string;
  usuario: Usuario;
  sede: string;
}

/**
 * Sesión del usuario que inició sesión (token del backend).
 * Con "recordar" se guarda en localStorage; si no, solo dura mientras la pestaña esté abierta.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly datos = signal<DatosSesion | null>(this.leer());

  readonly token = computed(() => this.datos()?.token ?? null);
  readonly usuario = computed(() => this.datos()?.usuario ?? null);
  readonly sede = computed(() => this.datos()?.sede ?? '');
  readonly haySesion = computed(() => !!this.datos());

  iniciar(respuesta: RespuestaLogin, recordar: boolean) {
    const datos: DatosSesion = { token: respuesta.token, usuario: respuesta.usuario, sede: respuesta.sede };
    this.datos.set(datos);
    this.guardar(datos, recordar);
  }

  cerrar() {
    this.datos.set(null);
    try {
      localStorage.removeItem(CLAVE_SESION);
      sessionStorage.removeItem(CLAVE_SESION);
    } catch { /* almacenamiento no disponible */ }
  }

  private guardar(datos: DatosSesion, recordar: boolean) {
    try {
      (recordar ? localStorage : sessionStorage).setItem(CLAVE_SESION, JSON.stringify(datos));
    } catch { /* almacenamiento no disponible */ }
  }

  private leer(): DatosSesion | null {
    try {
      const texto = localStorage.getItem(CLAVE_SESION) ?? sessionStorage.getItem(CLAVE_SESION);
      return texto ? (JSON.parse(texto) as DatosSesion) : null;
    } catch {
      return null;
    }
  }
}
