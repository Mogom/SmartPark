import { TipoVehiculo } from '../modelos';
import { soloDigitos } from './formato';

/** Formatos de placa en Colombia: carro ABC123, moto ABC12 o ABC12D. */
export const PATRON_PLACA: Record<TipoVehiculo, RegExp> = {
  CARRO: /^[A-Z]{3}\d{3}$/,
  MOTO: /^[A-Z]{3}\d{2}[A-Z]?$/,
};

export const esCorreoValido = (valor: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor.trim());

export const esContactoValido = (valor: string) => esCorreoValido(valor) || soloDigitos(valor).length === 10;
