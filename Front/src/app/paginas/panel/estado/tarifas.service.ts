import { Injectable, computed, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TarifasApiService } from '../../../nucleo/api';
import { CalculoCobro, CampoTarifa, Tarifas, TipoVehiculo, Vehiculo } from '../../../nucleo/modelos';
import {
  MS_POR_HORA, MS_POR_MINUTO, TIPOS_VEHICULO, calcularPrecio, errorYaNotificado, formatoCronometro, sumar,
} from '../../../nucleo/utilidades';
import { TARIFAS_EJEMPLO } from './datos-ejemplo';
import { RelojService } from './reloj.service';

const TARIFAS_VACIAS: Tarifas = {
  CARRO: { valorHora: 0, topeDiario: 0, cupos: 0 },
  MOTO: { valorHora: 0, topeDiario: 0, cupos: 0 },
};

/** Tarifas, topes y cupos; y el cálculo del cobro en vivo. */
@Injectable()
export class TarifasService {
  private readonly api = inject(TarifasApiService);
  private readonly reloj = inject(RelojService);
  private readonly usarApi = !environment.usarDatosEjemplo;

  readonly tarifas = signal<Tarifas>(this.usarApi ? TARIFAS_VACIAS : TARIFAS_EJEMPLO);
  /** Minutos iniciales que no se cobran. */
  readonly minutosGracia = signal(0);

  readonly cuposTotales = computed(() => sumar(TIPOS_VEHICULO, t => this.tarifas()[t.codigo].cupos));

  readonly textoRegla = computed(() =>
    (this.minutosGracia() ? `Los primeros ${this.minutosGracia()} minutos no se cobran. ` : '') +
    'Cada hora o fracción iniciada se cobra completa, con un tope por cada 24 horas.');

  constructor() {
    if (this.usarApi) this.api.obtener().subscribe({ next: t => this.tarifas.set(t), error: errorYaNotificado });
  }

  actualizar(tipo: TipoVehiculo, campo: CampoTarifa, valor: number) {
    const configuracion = { ...this.tarifas()[tipo], [campo]: Math.max(0, Number(valor) || 0) };
    const peticion$ = this.usarApi ? this.api.actualizar(tipo, configuracion) : of(configuracion);
    peticion$.subscribe({
      next: guardada => this.tarifas.update(t => ({ ...t, [tipo]: guardada })),
      error: errorYaNotificado,
    });
  }

  calcularCobro(vehiculo: Vehiculo, ahora = this.reloj.ahora()): CalculoCobro {
    const milisegundos = Math.max(0, ahora - vehiculo.horaEntrada);
    const { valorHora, topeDiario } = vehiculo;
    const enGracia = milisegundos <= this.minutosGracia() * MS_POR_MINUTO;
    const horas = enGracia ? 0 : Math.max(1, Math.ceil(milisegundos / MS_POR_HORA));
    const precio = calcularPrecio(horas, valorHora, topeDiario);
    return {
      milisegundos, horas, valorHora, topeDiario, enGracia,
      total: precio.total, aplicoTope: precio.aplicoTope, cronometro: formatoCronometro(milisegundos),
    };
  }
}
