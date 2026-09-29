import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CONFIGURACION_APP } from '../configuracion/configuracion-app';
import { CierreTurno, SolicitudCierreTurno } from '../modelos';

/** /api/turnos — cierre de caja de cada turno. */
@Injectable({ providedIn: 'root' })
export class TurnosApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(CONFIGURACION_APP).apiUrl}/turnos`;

  listarCierres(desde: number): Observable<CierreTurno[]> {
    const params = new HttpParams().set('desde', desde);
    return this.http.get<CierreTurno[]>(`${this.url}/cierres`, { params });
  }

  /** El backend calcula los totales a partir de las salidas del turno y guarda el consolidado. */
  cerrar(solicitud: SolicitudCierreTurno): Observable<CierreTurno> {
    return this.http.post<CierreTurno>(`${this.url}/cierres`, solicitud);
  }
}
