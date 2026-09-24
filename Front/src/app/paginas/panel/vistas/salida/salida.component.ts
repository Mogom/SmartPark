import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { MetodoPago } from '../../../../nucleo/modelos';
import {
  ETIQUETA_TIPO_VEHICULO, METODOS_PAGO, formatoDuracion, formatoHora, formatoMoneda, formatoNumero, soloDigitos,
} from '../../../../nucleo/utilidades';
import { RelojService, TarifasService, TurnoService, VisitasService } from '../../estado';

/** Búsqueda del vehículo, cálculo del cobro, vueltas y registro de la salida. */
@Component({
  selector: 'sp-salida',
  imports: [FormsModule, ...PIPES_FORMATO],
  templateUrl: './salida.component.html',
})
export class SalidaComponent {
  protected readonly turno = inject(TurnoService);
  private readonly visitas = inject(VisitasService);
  private readonly tarifas = inject(TarifasService);
  private readonly reloj = inject(RelojService);

  protected readonly metodosPago = METODOS_PAGO;
  protected readonly etiquetaTipo = ETIQUETA_TIPO_VEHICULO;
  protected readonly busqueda = signal('');
  protected readonly metodoPago = signal<MetodoPago>('EFECTIVO');
  protected readonly recibido = signal('');
  protected readonly error = signal('');
  protected readonly guardando = signal(false);

  protected readonly coincidencias = computed(() => {
    const texto = this.busqueda().toUpperCase();
    return this.visitas.dentroOrdenados()
      .filter(v => !texto || v.placa.includes(texto.replace(/\s/g, '')) || v.nombreVisitante.toUpperCase().includes(texto) || v.casa.toUpperCase().includes(texto))
      .map(vehiculo => ({ vehiculo, cobro: this.tarifas.calcularCobro(vehiculo) }));
  });

  protected readonly seleccionado = computed(() => {
    const vehiculo = this.visitas.dentro().find(v => v.id === this.visitas.idPorCobrar());
    if (!vehiculo) return null;
    const cobro = this.tarifas.calcularCobro(vehiculo);
    const formula = cobro.enGracia ? 'Gracia'
      : cobro.aplicoTope ? cobro.horas + ' h · tope diario'
      : cobro.horas + ' × ' + formatoMoneda(cobro.valorHora);
    return { vehiculo, cobro, horaSalida: formatoHora(this.reloj.ahora()), duracion: formatoDuracion(cobro.milisegundos), formula };
  });

  protected readonly total = computed(() => this.seleccionado()?.cobro.total ?? 0);
  protected readonly pagaEnEfectivo = computed(() => this.metodoPago() === 'EFECTIVO' && this.total() > 0);
  protected readonly valorRecibido = computed(() => Number(this.recibido() || 0));

  /** Billetes sugeridos para cobrar rápido. */
  protected readonly valoresRapidos = computed(() => {
    const t = this.total();
    const valores = [t, Math.ceil(t / 5000) * 5000, Math.ceil(t / 10000) * 10000, 20000, 50000, 100000].filter(x => x >= t && x > 0);
    return [...new Set(valores)].slice(0, 4).map(valor => ({ etiqueta: valor === t ? 'Exacto' : formatoMoneda(valor), valor }));
  });

  protected readonly puedeConfirmar = computed(() =>
    !!this.seleccionado() && !this.guardando() && (!this.pagaEnEfectivo() || this.valorRecibido() >= this.total()));

  protected readonly textoConfirmar = computed(() => this.pagaEnEfectivo()
    ? `Cobrar ${formatoMoneda(this.total())} y dar ${formatoMoneda(Math.max(0, this.valorRecibido() - this.total()))} de vueltas`
    : `Cobrar ${formatoMoneda(this.total())} y registrar salida`);

  protected recibidoConFormato() {
    return formatoNumero(this.recibido());
  }

  protected alCambiarRecibido(valor: string) {
    this.recibido.set(soloDigitos(valor).slice(0, 7));
  }

  protected elegir(idVehiculo: number) {
    this.visitas.idPorCobrar.set(idVehiculo);
    this.metodoPago.set('EFECTIVO');
    this.recibido.set('');
    this.error.set('');
  }

  protected volver() {
    this.visitas.idPorCobrar.set(null);
  }

  protected confirmar() {
    const seleccionado = this.seleccionado();
    if (!seleccionado || !this.puedeConfirmar()) return;
    const id = seleccionado.vehiculo.id;
    const error = this.visitas.validarSalida(id, this.metodoPago(), this.valorRecibido());
    if (error) return this.error.set(error);
    this.guardando.set(true);
    this.visitas.registrarSalida(id, this.metodoPago(), this.valorRecibido()).subscribe({
      next: () => { this.busqueda.set(''); this.recibido.set(''); this.guardando.set(false); },
      error: () => this.guardando.set(false),
    });
  }
}
