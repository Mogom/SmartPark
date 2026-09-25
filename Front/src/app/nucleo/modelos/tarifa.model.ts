import { TipoVehiculo } from './vehiculo.model';

export interface ConfiguracionTarifa {
  valorHora: number;
  /** Cobro máximo por cada bloque de 24 horas. */
  topeDiario: number;
  cupos: number;
}

export type Tarifas = Record<TipoVehiculo, ConfiguracionTarifa>;

export type CampoTarifa = keyof ConfiguracionTarifa;
