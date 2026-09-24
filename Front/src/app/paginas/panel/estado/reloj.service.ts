import { DestroyRef, Injectable, inject, signal } from '@angular/core';

/** Hora actual que se actualiza cada segundo (cronómetros y cobros en vivo). */
@Injectable()
export class RelojService {
  readonly ahora = signal(Date.now());

  constructor() {
    const intervalo = setInterval(() => this.ahora.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(intervalo));
  }
}
