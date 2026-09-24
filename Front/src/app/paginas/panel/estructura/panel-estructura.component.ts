import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { PIPES_FORMATO } from '../../../compartido/pipes/formato.pipes';
import { AutenticacionApiService } from '../../../nucleo/api';
import { NotificacionesService } from '../../../nucleo/servicios/notificaciones.service';
import { SesionService } from '../../../nucleo/servicios/sesion.service';
import { errorYaNotificado, formatoHoraConSegundos, nombreCorto } from '../../../nucleo/utilidades';
import { environment } from '../../../../environments/environment';
import { ModalTicketComponent } from '../componentes/modal-ticket/modal-ticket.component';
import { ModalTurnoComponent } from '../componentes/modal-turno/modal-turno.component';
import { CajaService, RelojService, TurnoService, UsuariosService, VisitasService } from '../estado';

interface OpcionMenu {
  ruta: string;
  exacta: boolean;
  etiqueta: string;
  etiquetaCorta: string;
  titulo: string;
}

export const MENU_PANEL: OpcionMenu[] = [
  { ruta: '/panel', exacta: true, etiqueta: 'Panel', etiquetaCorta: 'Panel', titulo: 'Resumen del día' },
  { ruta: '/panel/entrada', exacta: false, etiqueta: 'Registrar entrada', etiquetaCorta: 'Entrada', titulo: 'Registrar visitante' },
  { ruta: '/panel/dentro', exacta: false, etiqueta: 'Vehículos dentro', etiquetaCorta: 'Dentro', titulo: 'Vehículos dentro' },
  { ruta: '/panel/salida', exacta: false, etiqueta: 'Salida y cobro', etiquetaCorta: 'Salida', titulo: 'Salida y cobro' },
  { ruta: '/panel/caja', exacta: false, etiqueta: 'Caja y cuadre', etiquetaCorta: 'Caja', titulo: 'Caja y cuadre del turno' },
  { ruta: '/panel/historial', exacta: false, etiqueta: 'Historial', etiquetaCorta: 'Historial', titulo: 'Historial' },
  { ruta: '/panel/tarifas', exacta: false, etiqueta: 'Tarifas y cupos', etiquetaCorta: 'Tarifas', titulo: 'Tarifas y cupos' },
  { ruta: '/panel/porteros', exacta: false, etiqueta: 'Porteros', etiquetaCorta: 'Porteros', titulo: 'Gestión de porteros' },
];

/** Estructura del panel: menú lateral, encabezado, menú móvil y modales compartidos. */
@Component({
  selector: 'sp-panel-estructura',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ModalTurnoComponent, ModalTicketComponent, ...PIPES_FORMATO],
  templateUrl: './panel-estructura.component.html',
})
export class PanelEstructuraComponent implements OnInit {
  protected readonly turno = inject(TurnoService);
  protected readonly visitas = inject(VisitasService);
  protected readonly caja = inject(CajaService);
  protected readonly notificaciones = inject(NotificacionesService);
  private readonly usuarios = inject(UsuariosService);
  private readonly reloj = inject(RelojService);
  private readonly sesion = inject(SesionService);
  private readonly autenticacionApi = inject(AutenticacionApiService);
  private readonly router = inject(Router);

  protected readonly menu = MENU_PANEL;
  protected readonly confirmandoSalida = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );

  protected readonly titulo = computed(() => {
    const ruta = this.url().split('?')[0];
    const opcion = [...MENU_PANEL].reverse().find(o => (o.exacta ? ruta === o.ruta : ruta.startsWith(o.ruta)));
    return opcion?.titulo ?? 'Resumen del día';
  });

  protected readonly horaActual = computed(() => formatoHoraConSegundos(this.reloj.ahora()));

  protected readonly fechaSede = computed(() => {
    const fecha = new Date(this.reloj.ahora()).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    return this.turno.sede() + ' · ' + fecha.charAt(0).toUpperCase() + fecha.slice(1);
  });

  protected readonly porterosTurno = computed(() => this.turno.porterosEnTurno().map(nombreCorto).join(' · '));

  ngOnInit() {
    // Al entrar al panel se eligen los porteros de turno.
    this.turno.abrirModal();
  }

  protected irACerrarTurno() {
    this.confirmandoSalida.set(false);
    this.router.navigate(['/panel/caja']);
  }

  protected cerrarSesion() {
    this.confirmandoSalida.set(false);
    this.usuarios.bloquearAdministracion();
    if (!environment.usarDatosEjemplo) this.autenticacionApi.cerrarSesion().subscribe({ error: errorYaNotificado });
    this.sesion.cerrar();
    this.router.navigate(['/login']);
  }
}
