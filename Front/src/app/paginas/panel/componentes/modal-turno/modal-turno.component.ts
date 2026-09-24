import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PIPES_FORMATO } from '../../../../compartido/pipes/formato.pipes';
import { PropositoAutorizacion } from '../../../../nucleo/modelos';
import { TurnoService, UsuariosService } from '../../estado';

type Paso = 'CONTRASENA' | 'CODIGO' | 'NUEVA_CONTRASENA';

const MAXIMO_PORTEROS_POR_TURNO = 2;

/** Porteros de turno: entrar/salir del turno y cambiar quién registra, siempre con contraseña. */
@Component({
  selector: 'sp-modal-turno',
  imports: [FormsModule, ...PIPES_FORMATO],
  templateUrl: './modal-turno.component.html',
})
export class ModalTurnoComponent {
  protected readonly turno = inject(TurnoService);
  protected readonly usuarios = inject(UsuariosService);
  private readonly router = inject(Router);

  protected readonly aviso = signal('');
  protected readonly paso = signal<Paso>('CONTRASENA');
  protected readonly error = signal('');
  protected contrasena = '';
  protected codigo = '';
  /** Código mostrado en pantalla solo en modo de ejemplo. */
  protected codigoEjemplo: string | null = null;
  protected contrasenaNueva = '';
  protected confirmacion = '';

  protected readonly subtitulo = computed(() => {
    if (this.paso() === 'CODIGO') return 'Recuperar contraseña';
    if (this.paso() === 'NUEVA_CONTRASENA') return 'Crea una contraseña nueva';
    const proposito = this.turno.solicitudAutorizacion()?.proposito;
    return proposito === 'SALIR' ? 'Confirma con tu contraseña para salir del turno'
      : proposito === 'CAMBIAR' ? 'Confirma con tu contraseña para registrar a tu nombre'
      : 'Ingresa tu contraseña para entrar al turno';
  });

  protected readonly textoBoton = computed(() => {
    const proposito = this.turno.solicitudAutorizacion()?.proposito;
    return proposito === 'SALIR' ? 'Salir del turno' : proposito === 'CAMBIAR' ? 'Continuar' : 'Entrar al turno';
  });

  constructor() {
    // Cada vez que se abre una solicitud nueva, se reinicia el formulario.
    effect(() => {
      this.turno.solicitudAutorizacion();
      this.paso.set('CONTRASENA');
      this.error.set('');
      this.contrasena = this.codigo = this.contrasenaNueva = this.confirmacion = '';
    });
  }

  protected cerrar() {
    this.turno.cerrarModal();
    this.aviso.set('');
  }

  protected alternarPortero(nombre: string) {
    const enTurno = this.turno.porterosEnTurno();
    if (enTurno.includes(nombre)) {
      if (enTurno.length === 1) return this.aviso.set('Debe quedar al menos 1 portero en turno.');
      return this.pedirContrasena(nombre, 'SALIR');
    }
    if (enTurno.length >= MAXIMO_PORTEROS_POR_TURNO) return this.aviso.set(`Máximo ${MAXIMO_PORTEROS_POR_TURNO} porteros por turno. Quita uno primero.`);
    this.pedirContrasena(nombre, 'ENTRAR');
  }

  private pedirContrasena(nombre: string, proposito: PropositoAutorizacion) {
    this.aviso.set('');
    this.turno.solicitudAutorizacion.set({ nombre, proposito });
  }

  protected olvidoContrasena() {
    const solicitud = this.turno.solicitudAutorizacion();
    if (!solicitud) return;
    this.usuarios.enviarCodigo(solicitud.nombre).subscribe(codigo => {
      this.codigoEjemplo = codigo;
      this.codigo = '';
      this.error.set('');
      this.paso.set('CODIGO');
    });
  }

  protected alCambiarCodigo(valor: string) {
    this.codigo = valor.replace(/\D/g, '').slice(0, 6);
  }

  protected confirmar() {
    const solicitud = this.turno.solicitudAutorizacion();
    if (!solicitud) return;

    if (this.paso() === 'CONTRASENA') {
      this.usuarios.verificarContrasena(solicitud.nombre, this.contrasena).subscribe(valida => {
        if (valida) return this.turno.aplicarAutorizacion(solicitud);
        this.error.set('Contraseña incorrecta.');
        this.contrasena = '';
      });
      return;
    }

    if (this.paso() === 'CODIGO') {
      this.usuarios.verificarCodigo(solicitud.nombre, this.codigo).subscribe(valido => {
        if (!valido) return this.error.set('El código no coincide.');
        this.error.set('');
        this.paso.set('NUEVA_CONTRASENA');
      });
      return;
    }

    const error = this.usuarios.validarContrasenaNueva(this.contrasenaNueva, this.confirmacion);
    if (error) return this.error.set(error);
    this.usuarios.restablecerContrasena(solicitud.nombre, this.codigo, this.contrasenaNueva)
      .subscribe(() => this.turno.aplicarAutorizacion(solicitud));
  }

  protected gestionarPorteros() {
    this.cerrar();
    this.router.navigate(['/panel/porteros']);
  }
}
