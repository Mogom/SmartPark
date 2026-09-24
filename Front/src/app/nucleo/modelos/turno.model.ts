/** Consolidado que se genera al cerrar un turno. */
export interface CierreTurno {
  id: number;
  inicio: number;
  fin: number;
  porteros: string[];
  total: number;
  efectivo: number;
  tarjeta: number;
  transferencia: number;
  base: number;
  esperado: number;
  entradas: number;
  salidas: number;
  dentro: number;
  contado: number;
  diferencia: number;
}

export interface SolicitudCierreTurno {
  inicio: number;
  porteros: string[];
  base: number;
  contado: number;
}

/** Resumen de caja del turno en curso (calculado en el cliente). */
export interface ResumenTurno {
  total: number;
  efectivo: number;
  tarjeta: number;
  transferencia: number;
  pagosEfectivo: number;
  pagosTarjeta: number;
  pagosTransferencia: number;
  recibido: number;
  vueltas: number;
  esperado: number;
  salidas: number;
  entradas: number;
}

/** Para qué se pide la contraseña de un portero. */
export type PropositoAutorizacion = 'ENTRAR' | 'SALIR' | 'CAMBIAR';

export interface SolicitudAutorizacion {
  nombre: string;
  proposito: PropositoAutorizacion;
}
