/** Tipos de vehículo admitidos. Coinciden con el enum del backend. */
export type TipoVehiculo = 'CARRO' | 'MOTO';

/** Formas de pago de una salida. Coinciden con el enum del backend. */
export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'SIN_COBRO';

/** Vehículo visitante que está dentro del parqueadero. Fechas en milisegundos (epoch). */
export interface Vehiculo {
  id: number;
  placa: string;
  tipo: TipoVehiculo;
  nombreVisitante: string;
  casa: string;
  telefono: string;
  registradoPor: string;
  horaEntrada: number;
  /** Tarifa con la que entró; no cambia aunque se modifiquen las tarifas después. */
  valorHora: number;
  topeDiario: number;
}

/** Visita finalizada: vehículo que ya salió y pagó. */
export interface RegistroSalida extends Vehiculo {
  horaSalida: number;
  horasCobradas: number;
  total: number;
  aplicoTope: boolean;
  metodoPago: MetodoPago;
  valorRecibido: number;
  vueltas: number;
  finalizadoPor: string;
}

/** Datos que envía el portero al registrar una entrada. */
export interface SolicitudEntrada {
  placa: string;
  tipo: TipoVehiculo;
  nombreVisitante: string;
  casa: string;
  telefono: string;
  registradoPor: string;
}

/** Datos que envía el portero al registrar una salida. */
export interface SolicitudSalida {
  metodoPago: MetodoPago;
  valorRecibido: number;
  finalizadoPor: string;
}

/** Resultado de calcular el cobro de un vehículo en un momento dado (solo cliente). */
export interface CalculoCobro {
  milisegundos: number;
  horas: number;
  valorHora: number;
  topeDiario: number;
  enGracia: boolean;
  total: number;
  aplicoTope: boolean;
  cronometro: string;
}

/** Campos que llena el portero en pantalla (el portero que registra lo pone el sistema). */
export type FormularioEntrada = Omit<SolicitudEntrada, 'registradoPor'>;
