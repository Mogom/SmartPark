import { CajaService } from './caja.service';
import { RelojService } from './reloj.service';
import { ReportesService } from './reportes.service';
import { TarifasService } from './tarifas.service';
import { TicketService } from './ticket.service';
import { TurnoService } from './turno.service';
import { UsuariosService } from './usuarios.service';
import { VisitasService } from './visitas.service';

export { CajaService, RelojService, ReportesService, TarifasService, TicketService, TurnoService, UsuariosService, VisitasService };

/** Servicios de estado del panel; se registran en la ruta /panel. */
export const PROVEEDORES_ESTADO_PANEL = [
  RelojService, TicketService, TarifasService, TurnoService, UsuariosService, VisitasService, CajaService, ReportesService,
];
