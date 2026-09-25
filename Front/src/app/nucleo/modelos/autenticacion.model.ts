import { Usuario } from './usuario.model';

export interface CredencialesLogin {
  usuario: string;
  contrasena: string;
  recordar: boolean;
}

export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
  sede: string;
}

export interface SolicitudRestablecer {
  nombre: string;
  codigo: string;
  contrasenaNueva: string;
}
