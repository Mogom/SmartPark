import { Pipe, PipeTransform } from '@angular/core';
import {
  formatoDuracion, formatoHora, formatoMoneda, formatoPlaca, formatoTelefono, iniciales, nombreCorto, ocultarContacto,
} from '../../nucleo/utilidades';

@Pipe({ name: 'moneda' })
export class MonedaPipe implements PipeTransform {
  transform(valor: number | null | undefined) { return formatoMoneda(valor ?? 0); }
}

@Pipe({ name: 'placa' })
export class PlacaPipe implements PipeTransform {
  transform(placa: string) { return formatoPlaca(placa); }
}

@Pipe({ name: 'telefono' })
export class TelefonoPipe implements PipeTransform {
  transform(telefono: string) { return formatoTelefono(telefono); }
}

@Pipe({ name: 'hora' })
export class HoraPipe implements PipeTransform {
  transform(epoch: number) { return formatoHora(epoch); }
}

@Pipe({ name: 'duracion' })
export class DuracionPipe implements PipeTransform {
  transform(ms: number) { return formatoDuracion(ms); }
}

@Pipe({ name: 'nombreCorto' })
export class NombreCortoPipe implements PipeTransform {
  transform(nombre: string) { return nombreCorto(nombre); }
}

@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(nombre: string) { return iniciales(nombre); }
}

@Pipe({ name: 'ocultarContacto' })
export class OcultarContactoPipe implements PipeTransform {
  transform(contacto: string) { return ocultarContacto(contacto); }
}

export const PIPES_FORMATO = [
  MonedaPipe, PlacaPipe, TelefonoPipe, HoraPipe, DuracionPipe, NombreCortoPipe, InicialesPipe, OcultarContactoPipe,
] as const;
