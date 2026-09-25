import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VisitasApiService } from '../../../nucleo/api';
import { FormularioEntrada, MetodoPago, RegistroSalida, SolicitudEntrada, SolicitudSalida, Vehiculo } from '../../../nucleo/modelos';
import { PATRON_PLACA, TIPOS_VEHICULO, errorYaNotificado, formatoPlaca, inicioDelDia } from '../../../nucleo/utilidades';
import { crearDentroEjemplo, crearSalidasEjemplo } from './datos-ejemplo';
import { TarifasService } from './tarifas.service';
import { TicketService } from './ticket.service';
import { TurnoService } from './turno.service';

/** Vehículos dentro del parqueadero y salidas registradas (entradas y cobros). */
@Injectable()
export class VisitasService {
  private readonly api = inject(VisitasApiService);
  private readonly tarifas = inject(TarifasService);
  private readonly turno = inject(TurnoService);
  private readonly tickets = inject(TicketService);
  private readonly usarApi = !environment.usarDatosEjemplo;
  private siguienteIdEjemplo = 101;

  readonly dentro = signal<Vehiculo[]>([]);
  readonly salidas = signal<RegistroSalida[]>([]);
  /** Vehículo elegido en "Salida y cobro". */
  readonly idPorCobrar = signal<number | null>(null);

  readonly dentroOrdenados = computed(() => [...this.dentro()].sort((a, b) => a.horaEntrada - b.horaEntrada));

  readonly ocupacion = computed(() => TIPOS_VEHICULO.map(t => {
    const ocupados = this.dentro().filter(v => v.tipo === t.codigo).length;
    const cupos = this.tarifas.tarifas()[t.codigo].cupos;
    const sobrecupo = Math.max(0, ocupados - cupos);
    return {
      tipo: t.codigo, etiqueta: t.etiqueta, ocupados, cupos, sobrecupo,
      libres: Math.max(0, cupos - ocupados),
      porcentaje: cupos ? Math.min(100, (ocupados / cupos) * 100) : 0,
    };
  }));

  constructor() {
    if (this.usarApi) {
      this.api.listarDentro().subscribe({ next: l => this.dentro.set(l), error: errorYaNotificado });
      this.api.listarSalidas(inicioDelDia(Date.now())).subscribe({ next: l => this.salidas.set(l), error: errorYaNotificado });
    } else {
      const ahora = Date.now(), tarifas = this.tarifas.tarifas();
      this.dentro.set(crearDentroEjemplo(ahora, tarifas, this.siguienteIdEjemplo));
      this.siguienteIdEjemplo += this.dentro().length;
      this.salidas.set(crearSalidasEjemplo(ahora, tarifas, this.siguienteIdEjemplo));
      this.siguienteIdEjemplo += this.salidas().length;
    }
  }

  // ---------- entradas ----------

  validarEntrada(formulario: FormularioEntrada): string | null {
    const placa = formulario.placa.trim(), faltan: string[] = [];
    if (placa.length < 5) faltan.push('placa');
    else if (!PATRON_PLACA[formulario.tipo].test(placa)) {
      return formulario.tipo === 'CARRO' ? 'Placa de carro no válida. Formato: ABC123.' : 'Placa de moto no válida. Formato: ABC12D.';
    }
    if (!formulario.nombreVisitante.trim()) faltan.push('nombre');
    if (!formulario.casa.trim()) faltan.push('casa');
    if (formulario.telefono.length < 10) faltan.push('teléfono (10 dígitos)');
    if (faltan.length) return 'Falta: ' + faltan.join(', ') + '.';
    if (!this.turno.porteroActivo()) return 'Elige los porteros de turno antes de registrar.';
    if (this.dentro().some(v => v.placa === placa)) return formatoPlaca(placa) + ' ya está registrado dentro.';
    return null;
  }

  registrarEntrada(formulario: FormularioEntrada): Observable<Vehiculo> {
    const solicitud: SolicitudEntrada = {
      placa: formulario.placa.trim(), tipo: formulario.tipo, nombreVisitante: formulario.nombreVisitante.trim(),
      casa: formulario.casa.trim(), telefono: formulario.telefono, registradoPor: this.turno.porteroActivo(),
    };
    const peticion$ = this.usarApi ? this.api.registrarEntrada(solicitud) : of(this.crearVehiculoEjemplo(solicitud));
    return peticion$.pipe(tap(vehiculo => {
      this.dentro.update(l => [vehiculo, ...l]);
      this.tickets.mostrar({ tipo: 'ENTRADA', vehiculo });
    }));
  }

  // ---------- salidas ----------

  validarSalida(idVehiculo: number, metodoPago: MetodoPago, valorRecibido: number): string | null {
    const vehiculo = this.dentro().find(v => v.id === idVehiculo);
    if (!vehiculo) return 'El vehículo ya no está dentro.';
    const { total } = this.tarifas.calcularCobro(vehiculo);
    if (metodoPago === 'EFECTIVO' && total > 0 && valorRecibido < total) return 'El valor recibido es menor al total.';
    return null;
  }

  registrarSalida(idVehiculo: number, metodoPago: MetodoPago, valorRecibido: number): Observable<RegistroSalida> {
    const solicitud: SolicitudSalida = { metodoPago, valorRecibido, finalizadoPor: this.turno.porteroActivo() };
    const peticion$ = this.usarApi ? this.api.registrarSalida(idVehiculo, solicitud) : of(this.crearSalidaEjemplo(idVehiculo, solicitud));
    return peticion$.pipe(tap(registro => {
      this.dentro.update(l => l.filter(v => v.id !== idVehiculo));
      this.salidas.update(l => [registro, ...l]);
      this.idPorCobrar.set(null);
      this.tickets.mostrar({ tipo: 'SALIDA', registro });
    }));
  }

  // ---------- modo de ejemplo (en producción lo calcula el backend) ----------

  private crearVehiculoEjemplo(solicitud: SolicitudEntrada): Vehiculo {
    const { valorHora, topeDiario } = this.tarifas.tarifas()[solicitud.tipo];
    return { id: this.siguienteIdEjemplo++, ...solicitud, horaEntrada: Date.now(), valorHora, topeDiario };
  }

  private crearSalidaEjemplo(idVehiculo: number, solicitud: SolicitudSalida): RegistroSalida {
    const vehiculo = this.dentro().find(v => v.id === idVehiculo)!;
    const horaSalida = Date.now();
    const cobro = this.tarifas.calcularCobro(vehiculo, horaSalida);
    const efectivo = solicitud.metodoPago === 'EFECTIVO';
    const valorRecibido = efectivo && cobro.total > 0 ? solicitud.valorRecibido : 0;
    return {
      ...vehiculo, horaSalida, horasCobradas: cobro.horas, total: cobro.total, aplicoTope: cobro.aplicoTope,
      metodoPago: cobro.total === 0 ? 'SIN_COBRO' : solicitud.metodoPago,
      valorRecibido, vueltas: efectivo ? valorRecibido - cobro.total : 0, finalizadoPor: solicitud.finalizadoPor,
    };
  }
}
