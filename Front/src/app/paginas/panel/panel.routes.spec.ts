import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { RUTAS_PANEL } from './panel.routes';

/** Renderiza cada vista del panel con los datos de ejemplo y verifica que no haya errores. */
describe('Rutas del panel', () => {
  const errores: unknown[] = [];

  beforeEach(() => {
    errores.length = 0;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'panel', children: RUTAS_PANEL }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ErrorHandler, useValue: { handleError: (e: unknown) => errores.push(e) } },
      ],
    });
  });

  const vistas: [ruta: string, textoEsperado: string][] = [
    ['/panel', 'Entradas por hora'],
    ['/panel/entrada', 'Así se cobrará'],
    ['/panel/dentro', 'Registrar salida'],
    ['/panel/salida', 'Buscar por placa o nombre'],
    ['/panel/caja', 'Cuadre de efectivo'],
    ['/panel/historial', 'Sin salidas registradas hoy|Visitante'],
    ['/panel/tarifas', 'Solo administración'],
    ['/panel/porteros', 'Solo administración'],
  ];

  for (const [ruta, textoEsperado] of vistas) {
    it(`muestra ${ruta} sin errores`, async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(ruta);
      harness.detectChanges();
      expect(errores).toEqual([]);
      expect(harness.routeNativeElement?.textContent ?? '').toMatch(new RegExp(textoEsperado));
    });
  }
});
