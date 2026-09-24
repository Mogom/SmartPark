import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TurnosApiService } from '../../../nucleo/api';
import { CierreTurno, MetodoPago, ResumenTurno, SolicitudCierreTurno } from '../../../nucleo/modelos';
import { errorYaNotificado, inicioDelDia, sumar } from '../../../nucleo/utilidades';
import { TicketService } from './ticket.service';
import { TurnoService } from './turno.service';
import { VisitasService } from './visitas.service';

/** Caja del turno en curso y cierres de turno. */
@Injectable()
export class CajaService {
  private readonly api = inject(TurnosApiService);
  private readonly visitas = inject(VisitasService);
  private readonly turno = inject(TurnoService);
  private readonly tickets = inject(TicketService);
  private readonly usarApi = !environment.usarDatosEjemplo;

  readonly cierres = signal<CierreTurno[]>([]);

  /** Salidas cobradas durante el turno en curso. */
  readonly salidasTurno = computed(() => this.visitas.salidas().filter(s => s.horaSalida >= this.turno.inicio()));
  /** Vehículos que entraron en este turno y siguen dentro. */
  readonly dentroTurno = computed(() => this.visitas.dentro().filter(v => v.horaEntrada >= this.turno.inicio()));

  readonly resumen = computed<ResumenTurno>(() => {
    const salidas = this.salidasTurno();
    const delMetodo = (m: MetodoPago) => salidas.filter(s => s.metodoPago === m);
    const efectivo = sumar(delMetodo('EFECTIVO'), s => s.total);
    return {
      total: sumar(salidas, s => s.total),
      efectivo,
      tarjeta: sumar(delMetodo('TARJETA'), s => s.total),
      transferencia: sumar(delMetodo('TRANSFERENCIA'), s => s.total),
      pagosEfectivo: delMetodo('EFECTIVO').length,
      pagosTarjeta: delMetodo('TARJETA').length,
      pagosTransferencia: delMetodo('TRANSFERENCIA').length,
      recibido: sumar(salidas, s => s.valorRecibido),
      vueltas: sumar(salidas, s => s.vueltas),
      esperado: this.turno.baseCaja() + efectivo,
      salidas: salidas.length,
      entradas: salidas.length + this.dentroTurno().length,
    };
  });

  constructor() {
    if (this.usarApi) {
      this.api.listarCierres(inicioDelDia(Date.now())).subscribe({ next: l => this.cierres.set(l), error: errorYaNotificado });
    }
  }

  cerrarTurno(contado: number): Observable<CierreTurno> {
    const solicitud: SolicitudCierreTurno = {
      inicio: this.turno.inicio(), porteros: [...this.turno.porterosEnTurno()], base: this.turno.baseCaja(), contado,
    };
    const peticion$ = this.usarApi ? this.api.cerrar(solicitud) : of(this.crearCierreEjemplo(solicitud));
    return peticion$.pipe(tap(cierre => {
      this.cierres.update(l => [cierre, ...l]);
      this.turno.reiniciar(cierre.fin);
      this.tickets.mostrar({ tipo: 'CIERRE', cierre });
    }));
  }

  private crearCierreEjemplo(solicitud: SolicitudCierreTurno): CierreTurno {
    const r = this.resumen();
    return {
      id: this.cierres().length + 1, inicio: solicitud.inicio, fin: Date.now(), porteros: solicitud.porteros,
      total: r.total, efectivo: r.efectivo, tarjeta: r.tarjeta, transferencia: r.transferencia,
      base: solicitud.base, esperado: r.esperado, entradas: r.entradas, salidas: r.salidas,
      dentro: this.visitas.dentro().length, contado: solicitud.contado, diferencia: solicitud.contado - r.esperado,
    };
  }
}
