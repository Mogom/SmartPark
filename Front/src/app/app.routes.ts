import { Routes } from '@angular/router';
import { LandingComponent } from './componentes/landing/landing.component';
import { LoginComponent } from './componentes/login/login.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' },
];
