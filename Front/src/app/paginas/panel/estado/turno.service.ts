import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SolicitudAutorizacion } from '../../../nucleo/modelos';
import { SesionService } from '../../../nucleo/servicios/sesion.service';
import { BASE_CAJA_EJEMPLO, PORTEROS_EN_TURNO_EJEMPLO, SEDE_EJEMPLO, inicioTurnoEjemplo } from './datos-ejemplo';

/** Turno en curso: quiénes están en portería, quién registra y desde cuándo. */
@Injectable()
export class TurnoService {
  private readonly sesion = inject(SesionService);
  private readonly modoEjemplo = environment.usarDatosEjemplo;

  readonly sede = computed(() => this.modoEjemplo ? SEDE_EJEMPLO : this.sesion.sede());
  readonly porterosEnTurno = signal<string[]>(this.modoEjemplo ? PORTEROS_EN_TURNO_EJEMPLO : []);
  readonly porteroSeleccionado = signal(this.modoEjemplo ? PORTEROS_EN_TURNO_EJEMPLO[0] : '');
  readonly inicio = signal(this.modoEjemplo ? inicioTurnoEjemplo(Date.now()) : Date.now());
  readonly baseCaja = signal(this.modoEjemplo ? BASE_CAJA_EJEMPLO : 0);

  /** Modal de porteros de turno y la contraseña que se está pidiendo. */
  readonly modalAbierto = signal(false);
  readonly solicitudAutorizacion = signal<SolicitudAutorizacion | null>(null);

  /** Portero a cuyo nombre se registran entradas y salidas. */
  readonly porteroActivo = computed(() => {
    const enTurno = this.porterosEnTurno();
    return enTurno.includes(this.porteroSeleccionado()) ? this.porteroSeleccionado() : enTurno[0] ?? '';
  });

  /** Se llama cuando el portero ya confirmó su contraseña. */
  aplicarAutorizacion(solicitud: SolicitudAutorizacion) {
    const { nombre, proposito } = solicitud;
    if (proposito === 'SALIR') {
      this.quitarPortero(nombre);
    } else if (proposito === 'CAMBIAR') {
      this.porteroSeleccionado.set(nombre);
      this.modalAbierto.set(false);
    } else {
      if (!this.porterosEnTurno().includes(nombre)) this.porterosEnTurno.update(l => [...l, nombre]);
      if (!this.porterosEnTurno().includes(this.porteroSeleccionado())) this.porteroSeleccionado.set(nombre);
    }
    this.solicitudAutorizacion.set(null);
  }

  /** Pide la contraseña para registrar a nombre de otro portero del turno. */
  solicitarCambio(nombre: string) {
    if (nombre === this.porteroActivo()) return;
    this.solicitudAutorizacion.set({ nombre, proposito: 'CAMBIAR' });
    this.modalAbierto.set(true);
  }

  quitarPortero(nombre: string) {
    this.porterosEnTurno.update(l => l.filter(x => x !== nombre));
    if (this.porteroSeleccionado() === nombre) this.porteroSeleccionado.set(this.porterosEnTurno()[0] ?? '');
  }

  /** Empieza un turno nuevo (después de cerrar caja). */
  reiniciar(inicio: number) {
    this.inicio.set(inicio);
  }

  abrirModal() {
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.solicitudAutorizacion.set(null);
  }
}
