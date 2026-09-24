import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { FormularioEntrada, TipoVehiculo } from '../../../../nucleo/modelos';
import { TIPOS_VEHICULO, formatoHora, formatoTelefono, soloDigitos } from '../../../../nucleo/utilidades';
import { RelojService, TarifasService, TurnoService, VisitasService } from '../../estado';

const formularioVacio = (tipo: TipoVehiculo = 'CARRO'): FormularioEntrada =>
  ({ placa: '', tipo, nombreVisitante: '', casa: '', telefono: '' });

/** Registro de la entrada de un visitante. */
@Component({
  selector: 'sp-entrada',
  imports: [FormsModule, ...PIPES_FORMATO],
  templateUrl: './entrada.component.html',
})
export class EntradaComponent {
  protected readonly tarifas = inject(TarifasService);
  protected readonly turno = inject(TurnoService);
  protected readonly visitas = inject(VisitasService);
  private readonly reloj = inject(RelojService);

  protected readonly tiposVehiculo = TIPOS_VEHICULO;
  protected formulario = formularioVacio();
  protected readonly tipo = signal<TipoVehiculo>('CARRO');
  protected readonly error = signal('');
  protected readonly guardando = signal(false);

  protected readonly hora = computed(() => formatoHora(this.reloj.ahora()));
  protected readonly valorHora = computed(() => this.tarifas.tarifas()[this.tipo()].valorHora);
  protected readonly ejemplosCobro = computed(() =>
    [1, 2, 3, 5].map(h => ({ etiqueta: h + (h === 1 ? ' hora' : ' horas'), valor: h * this.valorHora() })));

  protected elegirTipo(tipo: TipoVehiculo) {
    this.formulario.tipo = tipo;
    this.tipo.set(tipo);
  }

  protected alCambiarPlaca(valor: string) {
    this.formulario.placa = valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    this.error.set('');
  }

  protected alCambiarTelefono(valor: string) {
    this.formulario.telefono = soloDigitos(valor).slice(0, 10);
    this.error.set('');
  }

  protected telefonoConFormato() {
    return formatoTelefono(this.formulario.telefono);
  }

  protected registrar() {
    if (this.guardando()) return;
    const error = this.visitas.validarEntrada(this.formulario);
    if (error) return this.error.set(error);
    this.error.set('');
    this.guardando.set(true);
    this.visitas.registrarEntrada(this.formulario).subscribe({
      next: () => { this.formulario = formularioVacio(this.formulario.tipo); this.guardando.set(false); },
      error: () => this.guardando.set(false),
    });
  }
}
