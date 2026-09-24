import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AutenticacionApiService, UsuariosApiService } from '../../../nucleo/api';
import { FormularioUsuario, SolicitudUsuario, Usuario } from '../../../nucleo/modelos';
import { errorYaNotificado, esContactoValido, soloDigitos } from '../../../nucleo/utilidades';
import { CONTRASENAS_EJEMPLO, USUARIOS_EJEMPLO } from './datos-ejemplo';
import { TurnoService } from './turno.service';

export const LONGITUD_MINIMA_CONTRASENA = 4;

/** Porteros y administradores; verificación de contraseñas y modo administración. */
@Injectable()
export class UsuariosService {
  private readonly api = inject(UsuariosApiService);
  private readonly autenticacionApi = inject(AutenticacionApiService);
  private readonly turno = inject(TurnoService);
  private readonly usarApi = !environment.usarDatosEjemplo;

  /** Solo en modo de ejemplo: contraseñas y códigos de recuperación en memoria. */
  private readonly contrasenasEjemplo = new Map(Object.entries(CONTRASENAS_EJEMPLO));
  private readonly codigosEjemplo = new Map<string, string>();

  readonly usuarios = signal<Usuario[]>(this.usarApi ? [] : USUARIOS_EJEMPLO);
  readonly porteros = computed(() => this.usuarios().filter(u => u.rol === 'PORTERO'));
  readonly administradores = computed(() => this.usuarios().filter(u => u.rol === 'ADMINISTRADOR'));

  readonly administracionDesbloqueada = signal(false);
  readonly administradorActual = signal('');

  constructor() {
    if (this.usarApi) this.api.listar().subscribe({ next: l => this.usuarios.set(l), error: errorYaNotificado });
  }

  contactoDe(nombre: string) {
    return this.usuarios().find(u => u.nombre === nombre)?.contacto ?? '';
  }

  // ---------- contraseñas ----------

  verificarContrasena(nombre: string, contrasena: string): Observable<boolean> {
    if (this.usarApi) return this.autenticacionApi.verificarContrasena(nombre, contrasena).pipe(map(r => r.valido));
    return of(this.contrasenasEjemplo.get(nombre) === contrasena);
  }

  /** Envía un código de recuperación. En modo de ejemplo devuelve el código para mostrarlo en pantalla. */
  enviarCodigo(nombre: string): Observable<string | null> {
    if (this.usarApi) return this.autenticacionApi.enviarCodigo(nombre).pipe(map(() => null));
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    this.codigosEjemplo.set(nombre, codigo);
    return of(codigo);
  }

  verificarCodigo(nombre: string, codigo: string): Observable<boolean> {
    if (this.usarApi) return this.autenticacionApi.verificarCodigo(nombre, codigo).pipe(map(r => r.valido));
    return of(this.codigosEjemplo.get(nombre) === codigo);
  }

  restablecerContrasena(nombre: string, codigo: string, contrasenaNueva: string): Observable<void> {
    if (this.usarApi) return this.autenticacionApi.restablecerContrasena({ nombre, codigo, contrasenaNueva });
    this.contrasenasEjemplo.set(nombre, contrasenaNueva);
    this.codigosEjemplo.delete(nombre);
    return of(undefined);
  }

  validarContrasenaNueva(contrasena: string, confirmacion: string): string | null {
    if (contrasena.length < LONGITUD_MINIMA_CONTRASENA) return `La contraseña debe tener mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`;
    if (contrasena !== confirmacion) return 'Las contraseñas no coinciden.';
    return null;
  }

  // ---------- modo administración ----------

  /** Devuelve true si la contraseña es de un administrador y desbloquea la administración. */
  desbloquearAdministracion(contrasena: string): Observable<boolean> {
    const nombre$ = this.usarApi
      ? this.autenticacionApi.verificarAdministrador(contrasena).pipe(map(r => (r.valido ? r.nombre ?? '' : null)))
      : of(this.administradores().find(a => this.contrasenasEjemplo.get(a.nombre) === contrasena)?.nombre ?? null);
    return nombre$.pipe(
      tap(nombre => { if (nombre !== null) this.desbloquearComo(nombre); }),
      map(nombre => nombre !== null),
    );
  }

  desbloquearComo(nombre: string) {
    this.administracionDesbloqueada.set(true);
    this.administradorActual.set(nombre);
  }

  bloquearAdministracion() {
    this.administracionDesbloqueada.set(false);
    this.administradorActual.set('');
  }

  // ---------- registro y eliminación ----------

  validarNuevo(formulario: FormularioUsuario): string | null {
    const nombre = formulario.nombre.trim();
    if (!nombre) return 'Escribe el nombre del portero.';
    if (this.usuarios().some(u => u.nombre.toLowerCase() === nombre.toLowerCase())) return 'Ya existe un usuario con ese nombre.';
    if (!esContactoValido(formulario.contacto)) return 'Escribe un correo válido o un teléfono de 10 dígitos.';
    return this.validarContrasenaNueva(formulario.contrasena, formulario.confirmacion);
  }

  agregar(formulario: FormularioUsuario): Observable<Usuario> {
    const solicitud: SolicitudUsuario = {
      nombre: formulario.nombre.trim(),
      contacto: formulario.contacto.includes('@') ? formulario.contacto.trim() : soloDigitos(formulario.contacto),
      contrasena: formulario.contrasena,
      rol: formulario.rol,
    };
    const peticion$ = this.usarApi ? this.api.crear(solicitud) : of(this.crearUsuarioEjemplo(solicitud));
    return peticion$.pipe(tap(usuario => this.usuarios.update(l => [...l, usuario])));
  }

  validarEliminacion(nombre: string): string | null {
    const usuario = this.usuarios().find(u => u.nombre === nombre);
    if (usuario?.rol === 'ADMINISTRADOR' && this.administradores().length === 1) return 'Debe quedar al menos un usuario de administración.';
    const enTurno = this.turno.porterosEnTurno();
    if (enTurno.includes(nombre) && enTurno.length === 1) return 'No puedes eliminar al único portero en turno. Agrega otro al turno primero.';
    return null;
  }

  eliminar(nombre: string): Observable<void> {
    const usuario = this.usuarios().find(u => u.nombre === nombre);
    if (!usuario) return of(undefined);
    const peticion$ = this.usarApi ? this.api.eliminar(usuario.id) : of(undefined);
    return peticion$.pipe(tap(() => {
      this.usuarios.update(l => l.filter(u => u.id !== usuario.id));
      this.turno.quitarPortero(nombre);
      this.contrasenasEjemplo.delete(nombre);
    }));
  }

  private crearUsuarioEjemplo(solicitud: SolicitudUsuario): Usuario {
    const id = Math.max(0, ...this.usuarios().map(u => u.id)) + 1;
    this.contrasenasEjemplo.set(solicitud.nombre, solicitud.contrasena);
    return { id, nombre: solicitud.nombre, contacto: solicitud.contacto, rol: solicitud.rol };
  }
}
