import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { ETIQUETA_METODO_PAGO, ETIQUETA_TIPO_VEHICULO, MESES, inicioDelDia, sumar } from '../../../../nucleo/utilidades';
import { RelojService, ReportesService, VisitasService } from '../../estado';

type Pestana = 'HOY' | 'MESES';

/** Salidas de hoy y recaudo por mes del año. */
@Component({
  selector: 'sp-historial',
  imports: [FormsModule, ...PIPES_FORMATO],
  templateUrl: './historial.component.html',
})
export class HistorialComponent {
  private readonly visitas = inject(VisitasService);
  private readonly reportes = inject(ReportesService);
  private readonly reloj = inject(RelojService);

  protected readonly etiquetaTipo = ETIQUETA_TIPO_VEHICULO;
  protected readonly etiquetaPago = ETIQUETA_METODO_PAGO;
  protected readonly anio = new Date().getFullYear();
  protected readonly pestana = signal<Pestana>('HOY');
  protected readonly busqueda = signal('');

  protected readonly salidasHoy = computed(() => {
    const desde = inicioDelDia(this.reloj.ahora());
    const texto = this.busqueda().toUpperCase();
    return this.visitas.salidas()
      .filter(s => s.horaSalida >= desde)
      .filter(s => !texto || s.placa.includes(texto.replace(/\s/g, '')) || s.nombreVisitante.toUpperCase().includes(texto) || s.casa.toUpperCase().includes(texto));
  });
  protected readonly totalHoy = computed(() => sumar(this.salidasHoy(), s => s.total));

  protected readonly meses = computed(() => {
    const mesActual = new Date(this.reloj.ahora()).getMonth();
    return this.reportes.recaudoMensual().map(m => ({
      ...m,
      etiqueta: MESES[m.mes].slice(0, 3),
      nombreCompleto: `${MESES[m.mes]} ${this.anio}`,
      enCurso: m.mes === mesActual,
    }));
  });
  protected readonly mesesDescendente = computed(() => [...this.meses()].reverse());
  protected readonly maximo = computed(() => Math.max(1, ...this.meses().map(m => m.total)));
  protected readonly totalAnio = computed(() => sumar(this.meses(), m => m.total));
  protected readonly promedioMensual = computed(() => this.totalAnio() / Math.max(1, this.meses().length));
  protected readonly mejorMes = computed(() => {
    const meses = this.meses();
    if (!meses.length) return '—';
    return MESES[meses.reduce((a, b) => (b.total > a.total ? b : a)).mes];
  });

  /** 2_233_000 → "2.2 M" */
  protected enMillones(valor: number) {
    return (valor / 1e6).toFixed(1) + ' M';
  }
}
