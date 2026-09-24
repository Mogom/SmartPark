import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private router = inject(Router);

  sede = 'Conjunto Altos del Parque';
  user = '';
  password = '';
  remember = true;
  showPassword = false;
  loading = false;
  error = '';

  submit() {
    if (!this.user.trim() || !this.password) { this.error = 'Escribe tu usuario y contraseña.'; return; }
    this.error = '';
    this.loading = true;
    // TODO: reemplazar por tu servicio de autenticación, p. ej.:
    // this.auth.login(this.user, this.password, this.remember).subscribe({
    //   next: () => this.router.navigate(['/panel']),
    //   error: () => { this.error = 'Usuario o contraseña incorrectos.'; this.loading = false; },
    // });
    setTimeout(() => {
      this.loading = false;
      if (this.password.length < 4) { this.error = 'Usuario o contraseña incorrectos.'; return; }
      this.router.navigate(['/panel']);
    }, 400);
  }
}
