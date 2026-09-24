import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { TipoVehiculo, Vehiculo } from '../../../../nucleo/modelos';
import { ETIQUETA_TIPO_VEHICULO, TIPOS_VEHICULO } from '../../../../nucleo/utilidades';
import { TarifasService, VisitasService } from '../../estado';

type FiltroTipo = 'TODOS' | TipoVehiculo;

/** Tarjetas de los vehículos que están dentro, con cronómetro y valor a cobrar. */
@Component({
  selector: 'sp-dentro',
  imports: [...PIPES_FORMATO],
  templateUrl: './dentro.component.html',
})
export class DentroComponent {
  private readonly visitas = inject(VisitasService);
  private readonly tarifas = inject(TarifasService);
  private readonly router = inject(Router);

  protected readonly etiquetaTipo = ETIQUETA_TIPO_VEHICULO;
  protected readonly filtro = signal<FiltroTipo>('TODOS');

  protected readonly filtros = computed(() => [
    { codigo: 'TODOS' as FiltroTipo, etiqueta: 'Todos', cantidad: this.visitas.dentro().length },
    ...TIPOS_VEHICULO.map(t => ({
      codigo: t.codigo as FiltroTipo, etiqueta: t.etiqueta, cantidad: this.visitas.dentro().filter(v => v.tipo === t.codigo).length,
    })),
  ]);

  protected readonly vehiculos = computed(() => this.visitas.dentroOrdenados()
    .filter(v => this.filtro() === 'TODOS' || v.tipo === this.filtro())
    .map(vehiculo => ({ vehiculo, cobro: this.tarifas.calcularCobro(vehiculo) })));

  protected cobrar(vehiculo: Vehiculo) {
    this.visitas.idPorCobrar.set(vehiculo.id);
    this.router.navigate(['/panel/salida']);
  }
}
