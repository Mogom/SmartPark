# SmartPark · Front

Aplicación Angular del parqueadero de visitantes: landing pública, inicio de sesión y panel de portería/administración.

## Ejecutar

```bash
npm install
npm start          # http://localhost:4200
npm test           # pruebas unitarias
npm run build      # compilación de producción en dist/
```

## Conexión con el backend

El front usa el backend desplegado en Render (`https://smartpark-fzas.onrender.com`):

```bash
cd Front && npm start                 # http://localhost:4200 → API de Render
```

Las peticiones a `/api` se redirigen a Render con `proxy.conf.json`, así que no hace falta CORS en desarrollo.
En el plan gratuito, Render apaga el servicio tras un rato sin uso: la primera petición puede tardar ~1 minuto.

Para probar cambios del backend en tu PC antes de desplegarlos:

```bash
cd Back && ./mvnw spring-boot:run     # API en http://localhost:8080
cd Front && npm run start:local       # usa proxy.local.conf.json → localhost:8080
```

Usuarios de prueba: administración Martha Gómez `9999`; porteros Carlos Mejía `1234`, Diana Rojas `5678`, Luis Herrera `0000`.

`src/environments/environment.development.ts` → `usarDatosEjemplo`:

- `false` (actual): todas las operaciones llaman a la API.
- `true`: la app funciona sin backend, con datos en memoria (`paginas/panel/estado/datos-ejemplo.ts`). Se pierden al recargar.

En producción (`environment.ts`) se usa el backend desplegado en Render (`https://smartpark-fzas.onrender.com/api`).
La configuración se lee con el token `CONFIGURACION_APP` (`nucleo/configuracion`), que las pruebas pueden reemplazar.

## Estructura

```
src/app/
  nucleo/                     lo que usa toda la app
    modelos/                  interfaces = contrato JSON con el backend
    api/                      un servicio HTTP por recurso (*-api.service.ts)
    interceptores/            token de sesión y manejo de errores HTTP
    configuracion/            CONFIGURACION_APP (apiUrl, usarDatosEjemplo)
    guardas/                  sesion.guard (protege /panel)
    servicios/                sesión y notificaciones globales
    utilidades/               formatos, validaciones, cálculo de cobro, constantes
  compartido/pipes/           moneda, placa, telefono, hora, duracion, nombreCorto, iniciales, ocultarContacto
  paginas/
    landing/                  página pública + formulario "Solicitar demo"
    login/
    panel/
      panel.routes.ts         rutas /panel/* y proveedores del estado
      estado/                 estado con signals, un servicio por dominio
                              (tarifas, turno, usuarios, visitas, caja, reportes, ticket, reloj)
      estructura/             menú lateral, encabezado y menú móvil
      vistas/                 inicio, entrada, dentro, salida, caja, historial, tarifas, porteros
      componentes/            modal-turno, modal-ticket, bloqueo-administracion
      estilos/_smartpark.scss
```

Flujo: **vista → servicio de estado → servicio de API → backend**. Las vistas no llaman a HTTP directamente.

## Convenciones

- Nombres en español: clases (`VisitasService`), archivos (`visitas-api.service.ts`), endpoints (`/api/visitas`).
- Enums del backend en mayúsculas: `'CARRO' | 'MOTO'`, `'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'SIN_COBRO'`, `'PORTERO' | 'ADMINISTRADOR'`.
- Fechas como epoch en milisegundos (`horaEntrada`, `horaSalida`, `inicio`, `fin`).
- Errores del backend con cuerpo `{ "mensaje": "..." }`; el interceptor lo muestra al usuario.
- Autenticación con token Bearer (`Authorization: Bearer <token>`).

## Endpoints que espera el front

| Método | Ruta | Cuerpo → Respuesta |
|---|---|---|
| POST | `/api/autenticacion/login` | `CredencialesLogin` → `RespuestaLogin` |
| POST | `/api/autenticacion/logout` | — |
| POST | `/api/autenticacion/verificar` | `{ nombre, contrasena }` → `{ valido }` |
| POST | `/api/autenticacion/verificar-administrador` | `{ contrasena }` → `{ valido, nombre }` |
| POST | `/api/autenticacion/codigo` | `{ nombre }` → envía código por correo/SMS |
| POST | `/api/autenticacion/verificar-codigo` | `{ nombre, codigo }` → `{ valido }` |
| POST | `/api/autenticacion/restablecer` | `SolicitudRestablecer` |
| GET | `/api/visitas/dentro` | → `Vehiculo[]` |
| GET | `/api/visitas/salidas?desde=` | → `RegistroSalida[]` |
| POST | `/api/visitas` | `SolicitudEntrada` → `Vehiculo` |
| POST | `/api/visitas/{id}/salida` | `SolicitudSalida` → `RegistroSalida` |
| GET | `/api/usuarios` | → `Usuario[]` |
| POST | `/api/usuarios` | `SolicitudUsuario` → `Usuario` |
| DELETE | `/api/usuarios/{id}` | — |
| GET | `/api/tarifas` | → `Tarifas` |
| PUT | `/api/tarifas/{tipo}` | `ConfiguracionTarifa` → `ConfiguracionTarifa` |
| GET | `/api/turnos/cierres?desde=` | → `CierreTurno[]` |
| POST | `/api/turnos/cierres` | `SolicitudCierreTurno` → `CierreTurno` |
| GET | `/api/reportes/recaudo-mensual?anio=` | → `ResumenMes[]` |
| POST | `/api/solicitudes-demo` | `SolicitudDemo` (público, sin sesión) |

Los tipos están en `src/app/nucleo/modelos/`. El cobro (hora o fracción, tope por cada 24 h) debe calcularlo el backend; el front solo lo muestra en vivo.
