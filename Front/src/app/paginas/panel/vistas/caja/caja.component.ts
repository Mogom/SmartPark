import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { CierreTurno, MetodoPago } from '../../../../nucleo/modelos';
import { formatoNumero, nombreCorto, soloDigitos, sumar } from '../../../../nucleo/utilidades';
import { CajaService, TicketService, TurnoService, UsuariosService } from '../../estado';

/** Cuadre de efectivo, recaudo por portero y cierre del turno. */
@Component({
  selector: 'sp-caja',
  imports: [FormsModule, ...PIPES_FORMATO],
  templateUrl: './caja.component.html',
})
export class CajaComponent {
  protected readonly caja = inject(CajaService);
  protected readonly turno = inject(TurnoService);
  private readonly usuarios = inject(UsuariosService);
  private readonly tickets = inject(TicketService);

  protected readonly contado = signal('');
  protected readonly error = signal('');
  protected readonly guardando = signal(false);

  /** Diferencia entre lo contado y lo esperado; null si aún no se ha contado. */
  protected readonly diferencia = computed(() =>
    this.contado() === '' ? null : Number(this.contado()) - this.caja.resumen().esperado);

  protected readonly tarjetas = computed(() => {
    const r = this.caja.resumen();
    return [
      { etiqueta: 'Recaudado en el turno', valor: r.total, detalle: r.salidas + ' salidas cobradas' },
      { etiqueta: 'Efectivo', valor: r.efectivo, detalle: r.pagosEfectivo + ' pagos' },
      { etiqueta: 'Tarjeta', valor: r.tarjeta, detalle: r.pagosTarjeta + ' pagos' },
      { etiqueta: 'Transferencia', valor: r.transferencia, detalle: r.pagosTransferencia + ' pagos' },
    ];
  });

  protected readonly porPortero = computed(() => {
    const salidas = this.caja.salidasTurno(), dentro = this.caja.dentroTurno();
    const nombres = [...new Set([
      ...this.turno.porterosEnTurno(), ...salidas.map(s => s.registradoPor), ...dentro.map(v => v.registradoPor), ...salidas.map(s => s.finalizadoPor),
    ])];
    return nombres.map(nombre => {
      const cobradas = salidas.filter(s => s.finalizadoPor === nombre);
      const delMetodo = (m: MetodoPago) => sumar(cobradas.filter(s => s.metodoPago === m), s => s.total);
      return {
        nombre,
        eliminado: !this.usuarios.usuarios().some(u => u.nombre === nombre),
        entradas: [...salidas, ...dentro].filter(v => v.registradoPor === nombre).length,
        salidas: cobradas.length,
        total: sumar(cobradas, s => s.total),
        efectivo: delMetodo('EFECTIVO'),
        tarjeta: delMetodo('TARJETA'),
        transferencia: delMetodo('TRANSFERENCIA'),
      };
    });
  });

  protected baseConFormato() {
    return formatoNumero(this.turno.baseCaja());
  }

  protected alCambiarBase(valor: string) {
    this.turno.baseCaja.set(Number(soloDigitos(valor).slice(0, 8)) || 0);
  }

  protected contadoConFormato() {
    return formatoNumero(this.contado());
  }

  protected alCambiarContado(valor: string) {
    this.contado.set(soloDigitos(valor).slice(0, 8));
    this.error.set('');
  }

  protected cerrarTurno() {
    if (this.guardando()) return;
    if (this.contado() === '') return this.error.set('Cuenta el efectivo y escríbelo en "Efectivo contado" antes de cerrar el turno.');
    this.guardando.set(true);
    this.caja.cerrarTurno(Number(this.contado())).subscribe({
      next: () => { this.contado.set(''); this.error.set(''); this.guardando.set(false); },
      error: () => this.guardando.set(false),
    });
  }

  protected verConsolidado(cierre: CierreTurno) {
    this.tickets.mostrar({ tipo: 'CIERRE', cierre });
  }

  protected porterosDe(cierre: CierreTurno) {
    return cierre.porteros.map(nombreCorto).join(' · ');
  }

  protected readonly valorAbsoluto = Math.abs;
}
