import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { Vehiculo } from '../../../../nucleo/modelos';
import { MS_POR_HORA, dosDigitos, formatoHora, formatoMoneda, formatoPlaca, inicioDelDia, nombreCorto, sumar } from '../../../../nucleo/utilidades';
import { CajaService, RelojService, TarifasService, TurnoService, VisitasService } from '../../estado';

interface Movimiento {
  hora: number;
  placa: string;
  esEntrada: boolean;
  valor: string;
}

/** Resumen del día: indicadores, entradas por hora, ocupación, movimientos y caja. */
@Component({
  selector: 'sp-inicio',
  imports: [RouterLink, ...PIPES_FORMATO],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  protected readonly visitas = inject(VisitasService);
  protected readonly tarifas = inject(TarifasService);
  protected readonly caja = inject(CajaService);
  private readonly turno = inject(TurnoService);
  private readonly reloj = inject(RelojService);
  private readonly router = inject(Router);

  private readonly inicioHoy = computed(() => inicioDelDia(this.reloj.ahora()));
  private readonly todasLasVisitas = computed(() => [...this.visitas.salidas(), ...this.visitas.dentro()]);

  protected readonly recaudoHoy = computed(() =>
    sumar(this.visitas.salidas().filter(s => s.horaSalida >= this.inicioHoy()), s => s.total));

  protected readonly visitantesHoy = computed(() =>
    this.todasLasVisitas().filter(v => v.horaEntrada >= this.inicioHoy()).length);

  protected readonly estanciaPromedio = computed(() => {
    const estancias = this.visitas.salidas().map(s => s.horaSalida - s.horaEntrada);
    const minutos = estancias.length ? Math.round(sumar(estancias, e => e) / estancias.length / 60000) : 0;
    return minutos >= 60 ? Math.floor(minutos / 60) + ' h ' + dosDigitos(minutos % 60) : minutos + ' min';
  });

  /** Entradas de las últimas 10 horas. */
  protected readonly grafica = computed(() => {
    const horaActual = new Date(this.reloj.ahora());
    horaActual.setMinutes(0, 0, 0);
    const barras: { etiqueta: string; cantidad: number }[] = [];
    for (let i = 9; i >= 0; i--) {
      const desde = horaActual.getTime() - i * MS_POR_HORA;
      barras.push({
        etiqueta: dosDigitos(new Date(desde).getHours()),
        cantidad: this.todasLasVisitas().filter(v => v.horaEntrada >= desde && v.horaEntrada < desde + MS_POR_HORA).length,
      });
    }
    const maximo = Math.max(1, ...barras.map(b => b.cantidad));
    const pico = barras.reduce((p, b) => (b.cantidad > p.cantidad ? b : p), barras[0]);
    return {
      horaPico: pico.cantidad ? `${pico.etiqueta}:00 · ${pico.cantidad}` : '—',
      barras: barras.map(b => ({ ...b, porcentaje: (b.cantidad / maximo) * 82, esPico: b === pico && b.cantidad > 0 })),
    };
  });

  protected readonly cuposLibres = computed(() => sumar(this.visitas.ocupacion(), o => o.libres));
  protected readonly porcentajeOcupacion = computed(() =>
    Math.round((this.visitas.dentro().length / Math.max(1, this.tarifas.cuposTotales())) * 100));

  protected readonly primerosDentro = computed(() =>
    this.visitas.dentroOrdenados().slice(0, 6).map(vehiculo => ({ vehiculo, cobro: this.tarifas.calcularCobro(vehiculo) })));

  protected readonly ultimosMovimientos = computed(() => {
    const movimientos: Movimiento[] = [
      ...this.todasLasVisitas().map(v => ({ hora: v.horaEntrada, placa: formatoPlaca(v.placa), esEntrada: true, valor: '' })),
      ...this.visitas.salidas().map(s => ({ hora: s.horaSalida, placa: formatoPlaca(s.placa), esEntrada: false, valor: formatoMoneda(s.total) })),
    ];
    return movimientos.sort((a, b) => b.hora - a.hora).slice(0, 7).map(m => ({ ...m, horaTexto: formatoHora(m.hora) }));
  });

  protected readonly pagosPorMetodo = computed(() => {
    const r = this.caja.resumen();
    return [
      { etiqueta: 'Efectivo', valor: r.efectivo },
      { etiqueta: 'Tarjeta', valor: r.tarjeta },
      { etiqueta: 'Transferencia', valor: r.transferencia },
    ];
  });

  protected readonly porterosTurno = computed(() => this.turno.porterosEnTurno().map(nombreCorto).join(' · '));

  protected cobrar(vehiculo: Vehiculo) {
    this.visitas.idPorCobrar.set(vehiculo.id);
    this.router.navigate(['/panel/salida']);
  }
}
