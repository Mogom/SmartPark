import { Component, inject } from '@angular/core';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { CampoTarifa, TipoVehiculo } from '../../../../nucleo/modelos';
import { TIPOS_VEHICULO } from '../../../../nucleo/utilidades';
import { BloqueoAdministracionComponent } from '../../componentes/bloqueo-administracion/bloqueo-administracion.component';
import { TarifasService } from '../../estado';

/** Valor hora, tope diario y cupos por tipo de vehículo (solo administración). */
@Component({
  selector: 'sp-tarifas',
  imports: [BloqueoAdministracionComponent, ...PIPES_FORMATO],
  templateUrl: './tarifas.component.html',
})
export class TarifasComponent {
  protected readonly tarifas = inject(TarifasService);
  protected readonly tiposVehiculo = TIPOS_VEHICULO;
  protected readonly horasEjemplo = [1, 2, 3, 5];

  protected actualizar(tipo: TipoVehiculo, campo: CampoTarifa, evento: Event) {
    this.tarifas.actualizar(tipo, campo, Number((evento.target as HTMLInputElement).value));
  }
}
