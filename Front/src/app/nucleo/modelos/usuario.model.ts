export type Rol = 'PORTERO' | 'ADMINISTRADOR';

/** Usuario del sistema. La contraseña nunca viaja al cliente. */
export interface Usuario {
  id: number;
  nombre: string;
  /** Correo o teléfono de 10 dígitos; ahí llega el código de recuperación. */
  contacto: string;
  rol: Rol;
}

export interface SolicitudUsuario {
  nombre: string;
  contacto: string;
  contrasena: string;
  rol: Rol;
}

/** Formulario de registro de usuario en pantalla (incluye la confirmación). */
export interface FormularioUsuario extends SolicitudUsuario {
  confirmacion: string;
}
