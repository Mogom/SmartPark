import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CredencialesLogin, RespuestaLogin, SolicitudRestablecer } from '../modelos';

export interface RespuestaVerificacion {
  valido: boolean;
  nombre?: string;
}

/** /api/autenticacion — login y verificación de contraseñas y códigos. */
@Injectable({ providedIn: 'root' })
export class AutenticacionApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/autenticacion`;

  iniciarSesion(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${this.url}/login`, credenciales);
  }

  cerrarSesion(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, {});
  }

  /** Confirma la contraseña de un portero (entrar/salir del turno, cambiar quién registra). */
  verificarContrasena(nombre: string, contrasena: string): Observable<RespuestaVerificacion> {
    return this.http.post<RespuestaVerificacion>(`${this.url}/verificar`, { nombre, contrasena });
  }

  /** Verifica la contraseña de administración; devuelve el nombre del administrador. */
  verificarAdministrador(contrasena: string): Observable<RespuestaVerificacion> {
    return this.http.post<RespuestaVerificacion>(`${this.url}/verificar-administrador`, { contrasena });
  }

  /** El backend envía un código de 6 dígitos al correo o teléfono del usuario. */
  enviarCodigo(nombre: string): Observable<void> {
    return this.http.post<void>(`${this.url}/codigo`, { nombre });
  }

  verificarCodigo(nombre: string, codigo: string): Observable<RespuestaVerificacion> {
    return this.http.post<RespuestaVerificacion>(`${this.url}/verificar-codigo`, { nombre, codigo });
  }

  restablecerContrasena(solicitud: SolicitudRestablecer): Observable<void> {
    return this.http.post<void>(`${this.url}/restablecer`, solicitud);
  }
}
