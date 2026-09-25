import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SolicitudDemo } from '../modelos';

/** /api/solicitudes-demo — formulario de contacto del landing (público). */
@Injectable({ providedIn: 'root' })
export class SolicitudesDemoApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/solicitudes-demo`;

  enviar(solicitud: SolicitudDemo): Observable<void> {
    return this.http.post<void>(this.url, solicitud);
  }
}
