import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResumenMes } from '../modelos';

/** /api/reportes — recaudo histórico. */
@Injectable({ providedIn: 'root' })
export class ReportesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes`;

  recaudoMensual(anio: number): Observable<ResumenMes[]> {
    const params = new HttpParams().set('anio', anio);
    return this.http.get<ResumenMes[]>(`${this.url}/recaudo-mensual`, { params });
  }
}
