import { CierreTurno } from './turno.model';
import { RegistroSalida, Vehiculo } from './vehiculo.model';

/** Comprobante que se muestra/imprime tras una operación. */
export type Ticket =
  | { tipo: 'ENTRADA'; vehiculo: Vehiculo }
  | { tipo: 'SALIDA'; registro: RegistroSalida }
  | { tipo: 'CIERRE'; cierre: CierreTurno };
