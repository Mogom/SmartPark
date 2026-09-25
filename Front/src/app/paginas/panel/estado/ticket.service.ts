import { Injectable, signal } from '@angular/core';
import { Ticket } from '../../../nucleo/modelos';

/** Comprobante que está abierto en pantalla (entrada, recibo o consolidado). */
@Injectable()
export class TicketService {
  readonly actual = signal<Ticket | null>(null);

  mostrar(ticket: Ticket) {
    this.actual.set(ticket);
  }

  cerrar() {
    this.actual.set(null);
  }
}
