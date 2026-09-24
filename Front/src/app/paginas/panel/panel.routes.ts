import { Routes } from '@angular/router';
import { sesionGuard } from '../../nucleo/guardas/sesion.guard';
import { PROVEEDORES_ESTADO_PANEL } from './estado';
import { PanelEstructuraComponent } from './estructura/panel-estructura.component';
import { CajaComponent } from './vistas/caja/caja.component';
import { DentroComponent } from './vistas/dentro/dentro.component';
import { EntradaComponent } from './vistas/entrada/entrada.component';
import { HistorialComponent } from './vistas/historial/historial.component';
import { InicioComponent } from './vistas/inicio/inicio.component';
import { PorterosComponent } from './vistas/porteros/porteros.component';
import { SalidaComponent } from './vistas/salida/salida.component';
import { TarifasComponent } from './vistas/tarifas/tarifas.component';

export const RUTAS_PANEL: Routes = [
  {
    path: '',
    component: PanelEstructuraComponent,
    canActivate: [sesionGuard],
    providers: PROVEEDORES_ESTADO_PANEL,
    children: [
      { path: '', component: InicioComponent, title: 'Panel · SmartPark' },
      { path: 'entrada', component: EntradaComponent, title: 'Registrar entrada · SmartPark' },
      { path: 'dentro', component: DentroComponent, title: 'Vehículos dentro · SmartPark' },
      { path: 'salida', component: SalidaComponent, title: 'Salida y cobro · SmartPark' },
      { path: 'caja', component: CajaComponent, title: 'Caja · SmartPark' },
      { path: 'historial', component: HistorialComponent, title: 'Historial · SmartPark' },
      { path: 'tarifas', component: TarifasComponent, title: 'Tarifas · SmartPark' },
      { path: 'porteros', component: PorterosComponent, title: 'Porteros · SmartPark' },
    ],
  },
];
