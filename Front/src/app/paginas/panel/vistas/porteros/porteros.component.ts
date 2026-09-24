import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { FormularioUsuario } from '../../../../nucleo/modelos';
import { BloqueoAdministracionComponent } from '../../componentes/bloqueo-administracion/bloqueo-administracion.component';
import { TurnoService, UsuariosService } from '../../estado';

const formularioVacio = (): FormularioUsuario => ({ nombre: '', contacto: '', contrasena: '', confirmacion: '', rol: 'PORTERO' });

/** Registro y eliminación de porteros y administradores (solo administración). */
@Component({
  selector: 'sp-porteros',
  imports: [FormsModule, BloqueoAdministracionComponent, ...PIPES_FORMATO],
  templateUrl: './porteros.component.html',
})
export class PorterosComponent {
  protected readonly usuarios = inject(UsuariosService);
  protected readonly turno = inject(TurnoService);

  protected formulario = formularioVacio();
  protected readonly error = signal('');
  protected readonly exito = signal('');
  protected readonly guardando = signal(false);
  /** Nombre del usuario que se está por eliminar (pide confirmación). */
  protected readonly confirmandoEliminar = signal<string | null>(null);

  protected limpiarMensajes() {
    this.error.set('');
    this.exito.set('');
  }

  protected guardar() {
    if (this.guardando()) return;
    const error = this.usuarios.validarNuevo(this.formulario);
    if (error) { this.exito.set(''); return this.error.set(error); }
    this.guardando.set(true);
    this.usuarios.agregar(this.formulario).subscribe({
      next: usuario => {
        this.limpiarMensajes();
        this.exito.set(usuario.nombre + ' quedó registrado.');
        this.formulario = formularioVacio();
        this.guardando.set(false);
      },
      error: () => this.guardando.set(false),
    });
  }

  protected eliminar(nombre: string) {
    this.confirmandoEliminar.set(null);
    const error = this.usuarios.validarEliminacion(nombre);
    if (error) { this.exito.set(''); return this.error.set(error); }
    this.usuarios.eliminar(nombre).subscribe({
      next: () => { this.error.set(''); this.exito.set(nombre + ' fue eliminado.'); },
      error: () => undefined,
    });
  }

  protected tipoContacto(contacto: string) {
    return contacto.includes('@') ? 'Correo' : 'Teléfono';
  }
}
