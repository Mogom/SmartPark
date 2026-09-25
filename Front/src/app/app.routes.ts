import { Routes } from '@angular/router';
import { LandingComponent } from './paginas/landing/landing.component';
import { LoginComponent } from './paginas/login/login.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'SmartPark · Parqueadero de visitantes' },
  { path: 'login', component: LoginComponent, title: 'Iniciar sesión · SmartPark' },
  { path: 'panel', loadChildren: () => import('./paginas/panel/panel.routes').then(m => m.RUTAS_PANEL) },
  { path: '**', redirectTo: '' },
];
