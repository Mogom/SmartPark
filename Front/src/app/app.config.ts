import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { autenticacionInterceptor } from './nucleo/interceptores/autenticacion.interceptor';
import { erroresHttpInterceptor } from './nucleo/interceptores/errores-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })),
    provideHttpClient(withFetch(), withInterceptors([autenticacionInterceptor, erroresHttpInterceptor])),
  ],
};
