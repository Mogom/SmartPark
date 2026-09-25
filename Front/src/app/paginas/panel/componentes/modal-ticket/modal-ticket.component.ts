import { Component, computed, inject } from '@angular/core';
import { CierreTurno, RegistroSalida, Vehiculo } from '../../../../nucleo/modelos';
import {
  ETIQUETA_METODO_PAGO, ETIQUETA_TIPO_VEHICULO, formatoDuracion, formatoHora, formatoMoneda, formatoPlaca, formatoTelefono, nombreCorto,
} from '../../../../nucleo/utilidades';
import { TicketService, TurnoService } from '../../estado';

interface Fila {
  etiqueta: string;
  valor: string;
}

interface VistaTicket {
  titulo: string;
  placa: string;
  filas: Fila[];
  etiquetaDestacada: string;
  valorDestacado: string;
  pie: string;
}

const numeroTicket = (id: number) => 'N.º ' + String(id).padStart(5, '0');

/** Ticket de entrada, recibo de pago y consolidado de turno (formato de impresora térmica). */
@Component({
  selector: 'sp-modal-ticket',
  templateUrl: './modal-ticket.component.html',
})
export class ModalTicketComponent {
  protected readonly turno = inject(TurnoService);
  private readonly tickets = inject(TicketService);

  protected readonly vista = computed<VistaTicket | null>(() => {
    const ticket = this.tickets.actual();
    if (!ticket) return null;
    switch (ticket.tipo) {
      case 'ENTRADA': return this.vistaEntrada(ticket.vehiculo);
      case 'SALIDA': return this.vistaSalida(ticket.registro);
      case 'CIERRE': return this.vistaCierre(ticket.cierre);
    }
  });

  protected cerrar() {
    this.tickets.cerrar();
  }

  protected imprimir() {
    window.print();
  }

  private vistaEntrada(v: Vehiculo): VistaTicket {
    return {
      titulo: 'TICKET DE ENTRADA', placa: formatoPlaca(v.placa), etiquetaDestacada: 'Hora de entrada', valorDestacado: formatoHora(v.horaEntrada),
      filas: [
        { etiqueta: 'Ticket', valor: numeroTicket(v.id) },
        { etiqueta: 'Fecha', valor: new Date(v.horaEntrada).toLocaleDateString('es-CO') },
        { etiqueta: 'Visitante', valor: v.nombreVisitante },
        { etiqueta: 'Casa', valor: v.casa },
        { etiqueta: 'Teléfono', valor: formatoTelefono(v.telefono) },
        { etiqueta: 'Vehículo', valor: ETIQUETA_TIPO_VEHICULO[v.tipo] },
        { etiqueta: 'Tarifa', valor: formatoMoneda(v.valorHora) + ' / h' },
        { etiqueta: 'Tope 24 h', valor: formatoMoneda(v.topeDiario) },
        { etiqueta: 'Registró', valor: v.registradoPor },
      ],
      pie: 'Hora o fracción iniciada se cobra completa. Conserve este ticket.',
    };
  }

  private vistaSalida(r: RegistroSalida): VistaTicket {
    const efectivo = r.metodoPago === 'EFECTIVO'
      ? [{ etiqueta: 'Recibido', valor: formatoMoneda(r.valorRecibido) }, { etiqueta: 'Vueltas', valor: formatoMoneda(r.vueltas) }]
      : [];
    return {
      titulo: 'RECIBO DE PAGO', placa: formatoPlaca(r.placa), etiquetaDestacada: 'TOTAL', valorDestacado: formatoMoneda(r.total),
      filas: [
        { etiqueta: 'Recibo', valor: numeroTicket(r.id) },
        { etiqueta: 'Visitante', valor: r.nombreVisitante },
        { etiqueta: 'Casa', valor: r.casa },
        { etiqueta: 'Entrada', valor: formatoHora(r.horaEntrada) + ' · ' + nombreCorto(r.registradoPor) },
        { etiqueta: 'Salida', valor: formatoHora(r.horaSalida) + ' · ' + nombreCorto(r.finalizadoPor) },
        { etiqueta: 'Tiempo', valor: formatoDuracion(r.horaSalida - r.horaEntrada) },
        { etiqueta: 'Cobro', valor: r.aplicoTope ? r.horasCobradas + ' h · tope diario' : r.horasCobradas + ' h × ' + formatoMoneda(r.valorHora) },
        { etiqueta: 'Pago', valor: ETIQUETA_METODO_PAGO[r.metodoPago] },
        ...efectivo,
      ],
      pie: 'Gracias por su visita.',
    };
  }

  private vistaCierre(c: CierreTurno): VistaTicket {
    const diferencia = c.diferencia === 0 ? 'Cuadrada' : (c.diferencia < 0 ? '−' : '+') + formatoMoneda(Math.abs(c.diferencia));
    return {
      titulo: 'CONSOLIDADO DE TURNO', placa: '', etiquetaDestacada: 'TOTAL', valorDestacado: formatoMoneda(c.total),
      filas: [
        { etiqueta: 'Turno', valor: formatoHora(c.inicio) + ' – ' + formatoHora(c.fin) },
        { etiqueta: 'Porteros', valor: c.porteros.map(nombreCorto).join(' / ') },
        { etiqueta: 'Entradas', valor: String(c.entradas) },
        { etiqueta: 'Salidas', valor: String(c.salidas) },
        { etiqueta: 'Aún dentro', valor: String(c.dentro) },
        { etiqueta: 'Efectivo', valor: formatoMoneda(c.efectivo) },
        { etiqueta: 'Tarjeta', valor: formatoMoneda(c.tarjeta) },
        { etiqueta: 'Transferencia', valor: formatoMoneda(c.transferencia) },
        { etiqueta: 'Base caja', valor: formatoMoneda(c.base) },
        { etiqueta: 'Debe haber', valor: formatoMoneda(c.esperado) },
        { etiqueta: 'Contado', valor: formatoMoneda(c.contado) },
        { etiqueta: 'Diferencia', valor: diferencia },
      ],
      pie: 'Firma portero entrega ______  Firma recibe ______',
    };
  }
}
