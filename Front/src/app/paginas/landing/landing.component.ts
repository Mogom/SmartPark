import {
  AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SolicitudesDemoApiService } from '../../nucleo/api';
import { mensajeDeError } from '../../nucleo/interceptores/errores-http.interceptor';
import { SolicitudDemo } from '../../nucleo/modelos';
import { dosDigitos, esCorreoValido, formatoCronometro, formatoMoneda, formatoTelefono, soloDigitos } from '../../nucleo/utilidades';

const TAMANOS_CONJUNTO = ['1–20', '21–50', '51–100', '100+'];

const formularioVacio = (): SolicitudDemo =>
  ({ nombre: '', correo: '', telefono: '', conjunto: '', ciudad: '', tamano: TAMANOS_CONJUNTO[0], mensaje: '' });

/** [placa, casa, segundos dentro al cargar, valor hora] de la maqueta animada del panel. */
const VEHICULOS_MAQUETA: [string, string, number, number][] = [
  ['KDM 482', 'Casa 14', 47 * 60 + 12, 3500],
  ['MXR 19F', 'Casa 31', 133 * 60, 1500],
  ['BTQ 775', 'Casa 8', 185 * 60, 3500],
  ['WEP 90C', 'Casa 22', 62 * 60, 1500],
];

/** Página pública: presentación del producto y formulario para solicitar una demostración. */
@Component({
  selector: 'app-landing',
  imports: [FormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('columnaMaqueta') private columnaMaqueta?: ElementRef<HTMLElement>;
  @ViewChild('maqueta') private maqueta?: ElementRef<HTMLElement>;

  private readonly anfitrion = inject(ElementRef<HTMLElement>);
  private readonly zona = inject(NgZone);
  private readonly solicitudesDemoApi = inject(SolicitudesDemoApiService);

  private readonly cargadoEn = Date.now();
  private intervaloReloj?: ReturnType<typeof setInterval>;
  private observadorAparicion?: IntersectionObserver;
  private observadorTamano?: ResizeObserver;
  private respaldoAparicion?: ReturnType<typeof setTimeout>;

  protected readonly anio = new Date().getFullYear();
  protected hora = '';
  protected filasMaqueta: { placa: string; casa: string; cronometro: string; cobro: string }[] = [];
  protected readonly barrasMaqueta = [2, 3, 5, 4, 7, 6, 9, 5, 4, 6].map((v, i) => ({ alto: (v / 9) * 100, destacada: i === 6 }));
  protected readonly mesesMaqueta = [['Abr', 62], ['May', 70], ['Jun', 66], ['Jul', 78], ['Ago', 74], ['Sep', 88]]
    .map(([etiqueta, porcentaje]) => ({ etiqueta: etiqueta as string, porcentaje: porcentaje as number }));
  protected readonly tamanos = TAMANOS_CONJUNTO;

  private escalaMaqueta = 0.7;
  private altoOriginalMaqueta = 480;
  private inclinada = true;

  protected formulario = formularioVacio();
  protected readonly enviado = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');

  protected get transformacionMaqueta() {
    return `scale(${this.escalaMaqueta})` + (this.inclinada ? ' rotateY(-12deg) rotateX(4deg)' : '');
  }

  protected get altoMaqueta() {
    return Math.round(this.altoOriginalMaqueta * this.escalaMaqueta + 40) + 'px';
  }

  protected get telefonoConFormato() {
    return formatoTelefono(this.formulario.telefono);
  }

  protected get primerNombre() {
    return this.formulario.nombre.trim().split(' ')[0];
  }

  ngOnInit() {
    this.actualizarReloj();
    this.intervaloReloj = setInterval(() => this.actualizarReloj(), 1000);
  }

  ngAfterViewInit() {
    this.zona.runOutsideAngular(() => {
      const medir = () => this.zona.run(() => this.medirMaqueta());
      this.observadorTamano = new ResizeObserver(medir);
      if (this.columnaMaqueta) this.observadorTamano.observe(this.columnaMaqueta.nativeElement);
      this.observadorTamano.observe(document.documentElement);
      setTimeout(medir);
      this.configurarAparicion();
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervaloReloj);
    clearTimeout(this.respaldoAparicion);
    this.observadorAparicion?.disconnect();
    this.observadorTamano?.disconnect();
  }

  protected alCambiarTelefono(valor: string) {
    this.formulario.telefono = soloDigitos(valor).slice(0, 10);
    this.error.set('');
  }

  protected enviar() {
    if (this.enviando()) return;
    const error = this.validar();
    if (error) return this.error.set(error);
    this.error.set('');

    if (environment.usarDatosEjemplo) {
      this.enviado.set(true);
      return;
    }
    this.enviando.set(true);
    this.solicitudesDemoApi.enviar(this.formulario).subscribe({
      next: () => { this.enviando.set(false); this.enviado.set(true); },
      error: e => { this.enviando.set(false); this.error.set(mensajeDeError(e)); },
    });
  }

  protected reiniciarFormulario() {
    this.formulario = formularioVacio();
    this.enviado.set(false);
    this.error.set('');
  }

  private validar(): string | null {
    const f = this.formulario, faltan: string[] = [];
    if (!f.nombre.trim()) faltan.push('nombre');
    if (!esCorreoValido(f.correo)) faltan.push('correo válido');
    if (f.telefono.length < 10) faltan.push('teléfono (10 dígitos)');
    if (!f.conjunto.trim()) faltan.push('conjunto');
    if (!f.ciudad.trim()) faltan.push('ciudad');
    return faltan.length ? 'Falta: ' + faltan.join(', ') + '.' : null;
  }

  private actualizarReloj() {
    const ahora = Date.now(), d = new Date(ahora);
    this.hora = `${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}:${dosDigitos(d.getSeconds())}`;
    const transcurrido = Math.floor((ahora - this.cargadoEn) / 1000);
    this.filasMaqueta = VEHICULOS_MAQUETA.map(([placa, casa, segundosIniciales, valorHora]) => {
      const segundos = segundosIniciales + transcurrido;
      return {
        placa, casa,
        cronometro: formatoCronometro(segundos * 1000),
        cobro: formatoMoneda(Math.max(1, Math.ceil(segundos / 3600)) * valorHora),
      };
    });
  }

  private medirMaqueta() {
    const columna = this.columnaMaqueta?.nativeElement, maqueta = this.maqueta?.nativeElement;
    this.inclinada = window.innerWidth >= 1100;
    this.escalaMaqueta = columna ? Math.min(1, columna.clientWidth / (this.inclinada ? 820 : 760)) : 1;
    this.altoOriginalMaqueta = maqueta ? maqueta.offsetHeight : 480;
  }

  /** Animación de aparición: se repite cada vez que la sección entra en pantalla. */
  private configurarAparicion() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const raiz: HTMLElement = this.anfitrion.nativeElement;
    const delBanner = Array.from(raiz.querySelectorAll<HTMLElement>('[data-reveal="hero"]'));
    const alDesplazar = Array.from(raiz.querySelectorAll<HTMLElement>('[data-reveal="scroll"]'));
    const preparar = (el: HTMLElement, retraso: number, distancia: number) => {
      el.dataset['dist'] = String(distancia);
      el.style.opacity = '0';
      el.style.transform = `translateY(${distancia}px)`;
      el.style.transition = `opacity .7s cubic-bezier(.2,.7,.2,1) ${retraso}ms, transform .7s cubic-bezier(.2,.7,.2,1) ${retraso}ms`;
    };
    const mostrar = (el: HTMLElement) => { el.style.opacity = '1'; el.style.transform = 'none'; };
    const ocultar = (el: HTMLElement) => { el.style.opacity = '0'; el.style.transform = `translateY(${el.dataset['dist'] || 30}px)`; };
    const estaEnPantalla = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };

    delBanner.forEach((el, i) => preparar(el, 120 + i * 110, 22));
    setTimeout(() => delBanner.forEach(mostrar), 60);

    alDesplazar.forEach(el => preparar(el, Number(el.dataset['delay'] || 0), 36));
    setTimeout(() => alDesplazar.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) mostrar(el); }), 80);
    this.respaldoAparicion = setTimeout(() => alDesplazar.forEach(el => { if (estaEnPantalla(el)) mostrar(el); }), 3000);

    if (!('IntersectionObserver' in window)) { alDesplazar.forEach(mostrar); return; }
    this.observadorAparicion = new IntersectionObserver(entradas => entradas.forEach(e => {
      const el = e.target as HTMLElement;
      if (e.isIntersecting) mostrar(el); else ocultar(el);
    }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    alDesplazar.forEach(el => this.observadorAparicion!.observe(el));
  }
}
