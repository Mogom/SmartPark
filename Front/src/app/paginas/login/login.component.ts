import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AutenticacionApiService } from '../../nucleo/api';
import { mensajeDeError } from '../../nucleo/interceptores/errores-http.interceptor';
import { SesionService } from '../../nucleo/servicios/sesion.service';

/** Inicio de sesión de la portería o la administración del conjunto. */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly autenticacionApi = inject(AutenticacionApiService);
  private readonly sesion = inject(SesionService);

  protected readonly modoEjemplo = environment.usarDatosEjemplo;
  protected readonly subtitulo = this.modoEjemplo ? 'Conjunto Altos del Parque' : 'Portería y administración';

  protected usuario = '';
  protected contrasena = '';
  protected readonly recordar = signal(true);
  protected readonly mostrarContrasena = signal(false);
  protected readonly ingresando = signal(false);
  protected readonly error = signal('');

  protected ingresar() {
    if (this.ingresando()) return;
    if (!this.usuario.trim() || !this.contrasena) return this.error.set('Escribe tu usuario y contraseña.');
    this.error.set('');
    this.ingresando.set(true);

    if (this.modoEjemplo) {
      // Sin backend: cualquier usuario con contraseña de 4 o más caracteres entra.
      setTimeout(() => {
        this.ingresando.set(false);
        if (this.contrasena.length < 4) return this.error.set('Usuario o contraseña incorrectos.');
        this.router.navigate(['/panel']);
      }, 400);
      return;
    }

    this.autenticacionApi.iniciarSesion({ usuario: this.usuario.trim(), contrasena: this.contrasena, recordar: this.recordar() })
      .subscribe({
        next: respuesta => {
          this.sesion.iniciar(respuesta, this.recordar());
          this.router.navigate(['/panel']);
        },
        error: (e: HttpErrorResponse) => {
          this.ingresando.set(false);
          this.error.set(e.status === 401 ? 'Usuario o contraseña incorrectos.' : mensajeDeError(e));
        },
      });
  }
}
