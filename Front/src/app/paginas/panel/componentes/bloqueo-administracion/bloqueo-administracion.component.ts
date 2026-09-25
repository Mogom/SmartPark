import { Component, OnDestroy, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { UsuariosService } from '../../estado';

type Paso = 'CONTRASENA' | 'ENVIAR_CODIGO' | 'CODIGO';

/** Envuelve una pantalla que solo puede ver administración. Incluye recuperación de contraseña. */
@Component({
  selector: 'sp-bloqueo-administracion',
  imports: [FormsModule, ...PIPES_FORMATO],
  templateUrl: './bloqueo-administracion.component.html',
})
export class BloqueoAdministracionComponent implements OnDestroy {
  protected readonly usuarios = inject(UsuariosService);
  protected readonly modoEjemplo = environment.usarDatosEjemplo;

  readonly texto = input('Esta sección requiere la contraseña de administración.');

  protected readonly paso = signal<Paso>('CONTRASENA');
  protected readonly error = signal('');
  protected contrasena = '';
  protected nombreRecuperacion = '';
  /** Código mostrado en pantalla solo en modo de ejemplo. */
  protected codigoEjemplo: string | null = null;
  protected codigo = '';
  protected contrasenaNueva = '';
  protected confirmacion = '';

  protected desbloquear() {
    this.usuarios.desbloquearAdministracion(this.contrasena).subscribe(valido => {
      this.contrasena = '';
      this.error.set(valido ? '' : 'Contraseña de administración incorrecta.');
    });
  }

  protected iniciarRecuperacion() {
    this.nombreRecuperacion = this.usuarios.administradores()[0]?.nombre ?? '';
    this.error.set('');
    this.paso.set('ENVIAR_CODIGO');
  }

  protected enviarCodigo() {
    this.usuarios.enviarCodigo(this.nombreRecuperacion).subscribe(codigo => {
      this.codigoEjemplo = codigo;
      this.codigo = '';
      this.error.set('');
      this.paso.set('CODIGO');
    });
  }

  protected alCambiarCodigo(valor: string) {
    this.codigo = valor.replace(/\D/g, '').slice(0, 6);
  }

  protected guardar() {
    const error = this.usuarios.validarContrasenaNueva(this.contrasenaNueva, this.confirmacion);
    if (error) return this.error.set(error);
    const nombre = this.nombreRecuperacion;
    this.usuarios.verificarCodigo(nombre, this.codigo).pipe(
      switchMap(valido => valido ? this.usuarios.restablecerContrasena(nombre, this.codigo, this.contrasenaNueva).pipe(map(() => true)) : of(false)),
    ).subscribe(restablecida => {
      if (!restablecida) return this.error.set('El código no coincide.');
      this.usuarios.desbloquearComo(nombre);
      this.cancelar();
    });
  }

  protected cancelar() {
    this.paso.set('CONTRASENA');
    this.error.set('');
    this.codigo = this.contrasenaNueva = this.confirmacion = '';
  }

  protected tipoContacto() {
    return this.usuarios.contactoDe(this.nombreRecuperacion).includes('@') ? 'correo' : 'teléfono';
  }

  ngOnDestroy() {
    this.usuarios.bloquearAdministracion();
  }
}
