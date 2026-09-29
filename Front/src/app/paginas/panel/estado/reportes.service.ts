import { Injectable, computed, inject, signal } from '@angular/core';
import { CONFIGURACION_APP } from '../../../nucleo/configuracion/configuracion-app';
import { ReportesApiService } from '../../../nucleo/api';
import { ResumenMes } from '../../../nucleo/modelos';
import { errorYaNotificado, sumar } from '../../../nucleo/utilidades';
import { crearRecaudoMensualEjemplo } from './datos-ejemplo';
import { RelojService } from './reloj.service';
import { VisitasService } from './visitas.service';

/** Recaudo por mes del año en curso. */
@Injectable()
export class ReportesService {
  private readonly api = inject(ReportesApiService);
  private readonly visitas = inject(VisitasService);
  private readonly reloj = inject(RelojService);
  private readonly usarApi = !inject(CONFIGURACION_APP).usarDatosEjemplo;

  private readonly recaudoApi = signal<ResumenMes[]>([]);

  readonly recaudoMensual = computed<ResumenMes[]>(() => {
    if (this.usarApi) return this.recaudoApi();
    const salidas = this.visitas.salidas();
    return crearRecaudoMensualEjemplo(
      this.reloj.ahora(), salidas.length + this.visitas.dentro().length, sumar(salidas, s => s.total));
  });

  constructor() {
    if (this.usarApi) {
      this.api.recaudoMensual(new Date().getFullYear()).subscribe({ next: l => this.recaudoApi.set(l), error: errorYaNotificado });
    }
  }
}
