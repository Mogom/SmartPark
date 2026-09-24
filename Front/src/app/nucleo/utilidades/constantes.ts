import { MetodoPago, TipoVehiculo } from '../modelos';

export const TIPOS_VEHICULO: { codigo: TipoVehiculo; etiqueta: string }[] = [
  { codigo: 'CARRO', etiqueta: 'Carro' },
  { codigo: 'MOTO', etiqueta: 'Moto' },
];

export const ETIQUETA_TIPO_VEHICULO: Record<TipoVehiculo, string> = { CARRO: 'Carro', MOTO: 'Moto' };

/** Métodos que el portero puede elegir al cobrar ('SIN_COBRO' lo asigna el sistema). */
export const METODOS_PAGO: { codigo: MetodoPago; etiqueta: string }[] = [
  { codigo: 'EFECTIVO', etiqueta: 'Efectivo' },
  { codigo: 'TARJETA', etiqueta: 'Tarjeta' },
  { codigo: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
];

export const ETIQUETA_METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia', SIN_COBRO: 'Sin cobro',
};

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const MS_POR_MINUTO = 60_000;
export const MS_POR_HORA = 3_600_000;
