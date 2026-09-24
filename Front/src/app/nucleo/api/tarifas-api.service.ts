import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfiguracionTarifa, Tarifas, TipoVehiculo } from '../modelos';

/** /api/tarifas — valor hora, tope diario y cupos por tipo de vehículo. */
@Injectable({ providedIn: 'root' })
export class TarifasApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/tarifas`;

  obtener(): Observable<Tarifas> {
    return this.http.get<Tarifas>(this.url);
  }

  actualizar(tipo: TipoVehiculo, configuracion: ConfiguracionTarifa): Observable<ConfiguracionTarifa> {
    return this.http.put<ConfiguracionTarifa>(`${this.url}/${tipo}`, configuracion);
  }
}
