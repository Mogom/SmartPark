import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegistroSalida, SolicitudEntrada, SolicitudSalida, Vehiculo } from '../modelos';

/** /api/visitas — entradas y salidas de vehículos visitantes. */
@Injectable({ providedIn: 'root' })
export class VisitasApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/visitas`;

  listarDentro(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.url}/dentro`);
  }

  /** Salidas registradas desde una fecha (epoch ms). */
  listarSalidas(desde: number): Observable<RegistroSalida[]> {
    const params = new HttpParams().set('desde', desde);
    return this.http.get<RegistroSalida[]>(`${this.url}/salidas`, { params });
  }

  registrarEntrada(solicitud: SolicitudEntrada): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.url, solicitud);
  }

  registrarSalida(idVehiculo: number, solicitud: SolicitudSalida): Observable<RegistroSalida> {
    return this.http.post<RegistroSalida>(`${this.url}/${idVehiculo}/salida`, solicitud);
  }
}
