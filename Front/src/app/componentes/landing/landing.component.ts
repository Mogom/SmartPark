import {
  AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DemoForm { name: string; email: string; phone: string; org: string; city: string; size: string; msg: string; }
const pad = (n: number) => String(n).padStart(2, '0');
const money = (n: number) => '$\u00a0' + Math.round(n).toLocaleString('es-CO');
const emptyForm = (): DemoForm => ({ name: '', email: '', phone: '', org: '', city: '', size: '1–20', msg: '' });

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mockCol') mockCol?: ElementRef<HTMLElement>;
  @ViewChild('mock') mock?: ElementRef<HTMLElement>;

  private host = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);
  private start = Date.now() - (47 * 60 + 12) * 1000;
  private timer?: ReturnType<typeof setInterval>;
  private io?: IntersectionObserver;
  private ro?: ResizeObserver;
  private fallback?: ReturnType<typeof setTimeout>;

  year = new Date().getFullYear();
  clock = '';
  rows: { plate: string; house: string; timer: string; cost: string }[] = [];
  bars = [2, 3, 5, 4, 7, 6, 9, 5, 4, 6].map((v, i) => ({ h: (v / 9) * 100, on: i === 6 }));
  months = [['Abr', 62], ['May', 70], ['Jun', 66], ['Jul', 78], ['Ago', 74], ['Sep', 88]] as const;
  sizes = ['1–20', '21–50', '51–100', '100+'];

  mockScale = 0.7;
  mockHeight = 480;
  tilt = true;

  form: DemoForm = emptyForm();
  sent = false;
  error = '';

  get mockTransform() {
    return `scale(${this.mockScale})` + (this.tilt ? ' rotateY(-12deg) rotateX(4deg)' : '');
  }
  get mockBoxHeight() { return Math.round(this.mockHeight * this.mockScale + 40) + 'px'; }
  get phoneDisplay() {
    const p = this.form.phone;
    return p.length > 6 ? `${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}` : p.length > 3 ? `${p.slice(0, 3)} ${p.slice(3)}` : p;
  }
  get firstName() { return this.form.name.trim().split(' ')[0]; }

  ngOnInit() {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const measure = () => this.zone.run(() => this.measure());
      this.ro = new ResizeObserver(measure);
      if (this.mockCol) this.ro.observe(this.mockCol.nativeElement);
      this.ro.observe(document.documentElement);
      setTimeout(measure);
      this.setupReveal();
    });
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    clearTimeout(this.fallback);
    this.io?.disconnect();
    this.ro?.disconnect();
  }

  onPhone(v: string) { this.form.phone = v.replace(/\D/g, '').slice(0, 10); this.error = ''; }

  submit() {
    const f = this.form, miss: string[] = [];
    if (!f.name.trim()) miss.push('nombre');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) miss.push('correo válido');
    if (f.phone.length < 10) miss.push('teléfono (10 dígitos)');
    if (!f.org.trim()) miss.push('conjunto');
    if (!f.city.trim()) miss.push('ciudad');
    if (miss.length) { this.error = 'Falta: ' + miss.join(', ') + '.'; return; }
    // TODO: enviar a tu backend, p. ej. this.http.post('/api/demo', this.form)
    this.error = '';
    this.sent = true;
  }

  resetForm() { this.form = emptyForm(); this.sent = false; this.error = ''; }

  private tick() {
    const now = Date.now(), d = new Date(now);
    this.clock = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const elapsed = Math.floor((now - this.start) / 1000) - (47 * 60 + 12);
    this.rows = ([['KDM 482', 'Casa 14', 47 * 60 + 12, 3500], ['MXR 19F', 'Casa 31', 133 * 60, 1500],
      ['BTQ 775', 'Casa 8', 185 * 60, 3500], ['WEP 90C', 'Casa 22', 62 * 60, 1500]] as [string, string, number, number][])
      .map(([plate, house, off, rate]) => {
        const s = Math.max(0, off + elapsed);
        return { plate, house, timer: `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`, cost: money(Math.max(1, Math.ceil(s / 3600)) * rate) };
      });
  }

  private measure() {
    const col = this.mockCol?.nativeElement, m = this.mock?.nativeElement;
    const w = window.innerWidth;
    this.tilt = w >= 1100;
    this.mockScale = col ? Math.min(1, col.clientWidth / (this.tilt ? 820 : 760)) : 1;
    this.mockHeight = m ? m.offsetHeight : 480;
  }

  /** Animación de aparición: se repite cada vez que la sección entra en pantalla. */
  private setupReveal() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const root: HTMLElement = this.host.nativeElement;
    const hero = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal="hero"]'));
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal="scroll"]'));
    const prep = (el: HTMLElement, delay: number, dist: number) => {
      el.dataset['dist'] = String(dist);
      el.style.opacity = '0';
      el.style.transform = `translateY(${dist}px)`;
      el.style.transition = `opacity .7s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .7s cubic-bezier(.2,.7,.2,1) ${delay}ms`;
    };
    const show = (el: HTMLElement) => { el.style.opacity = '1'; el.style.transform = 'none'; };
    const hide = (el: HTMLElement) => { el.style.opacity = '0'; el.style.transform = `translateY(${el.dataset['dist'] || 30}px)`; };

    hero.forEach((el, i) => prep(el, 120 + i * 110, 22));
    setTimeout(() => hero.forEach(show), 60);

    items.forEach(el => prep(el, Number(el.dataset['delay'] || 0), 36));
    setTimeout(() => items.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) show(el); }), 80);
    this.fallback = setTimeout(() => items.forEach(el => {
      const r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) show(el);
    }), 3000);

    if (!('IntersectionObserver' in window)) { items.forEach(show); return; }
    this.io = new IntersectionObserver(entries => entries.forEach(e => {
      const el = e.target as HTMLElement;
      if (e.isIntersecting) show(el); else hide(el);
    }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => this.io!.observe(el));
  }
}
