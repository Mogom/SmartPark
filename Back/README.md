# SmartPark Backend

API REST en Spring Boot y Kotlin. Actualmente usa repositorios en memoria para que el frontend pueda avanzar sin una base de datos. Los controladores dependen de servicios y repositorios, por lo que la futura integracion con PostgreSQL puede reemplazar las implementaciones mock sin cambiar las rutas.

## Ejecutar

Desde esta carpeta (necesita Java 17; Maven no hace falta, lo descarga el wrapper):

```bash
./mvnw spring-boot:run     # Windows (cmd/PowerShell): mvnw.cmd spring-boot:run
./mvnw test                # pruebas
```

La API queda disponible en `http://localhost:8080`.

## Rutas principales

Todas las rutas empiezan por `/api/v1`:

| Metodo | Ruta | Uso |
| --- | --- | --- |
| GET | `/complexes` | Listar conjuntos residenciales |
| GET | `/complexes/{id}` | Consultar un conjunto |
| GET | `/residents?complexId=1` | Listar residentes |
| GET | `/vehicles?complexId=1&residentId=1` | Listar vehiculos con filtros |
| GET | `/parking-spaces?complexId=1&status=AVAILABLE` | Consultar espacios |
| GET | `/reservations?complexId=1&status=ACTIVE` | Consultar reservas |
| POST | `/reservations` | Crear una reserva mock |
| GET | `/dashboard/summary?complexId=1` | Indicadores del parqueadero |

Ejemplo de reserva:

```json
{
  "parkingSpaceId": 1,
  "vehicleId": 1,
  "residentId": 1,
  "complexId": 1,
  "startsAt": "2026-09-24T18:00:00",
  "endsAt": "2026-09-24T20:00:00"
}
```

## Parqueadero de visitantes (lo que usa el front)

Paquete `co.smartpark.visitantes` (`dominio`, `repositorio`, `servicio`, `web`). Rutas bajo `/api`, con el mismo contrato JSON que `Front/src/app/nucleo/modelos`. Datos en memoria (`DatosIniciales.kt`) hasta tener base de datos.

- **Sesión**: `POST /api/autenticacion/login` devuelve un token. Las demás rutas piden `Authorization: Bearer <token>`, salvo `POST /api/solicitudes-demo` (formulario público del landing).
- **Errores**: siempre `{ "mensaje": "..." }` con el código HTTP correspondiente (400, 401, 404, 409).
- **Fechas**: epoch en milisegundos.
- **Contraseñas**: se guardan cifradas (SHA-256 con sal). Para producción, cambiar a BCrypt.
- **Recuperación de contraseña**: por ahora el código de 6 dígitos se escribe en el log del servidor; falta enviarlo por correo o SMS.

Usuarios de prueba: Martha Gómez `9999` (administración); porteros Carlos Mejía `1234`, Diana Rojas `5678`, Luis Herrera `0000`.

| Metodo | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/autenticacion/login` | Iniciar sesión (usuario = nombre, correo o teléfono) |
| POST | `/api/autenticacion/logout` | Cerrar sesión |
| POST | `/api/autenticacion/verificar` | Confirmar contraseña de un portero |
| POST | `/api/autenticacion/verificar-administrador` | Confirmar contraseña de administración |
| POST | `/api/autenticacion/codigo` | Generar código de recuperación |
| POST | `/api/autenticacion/verificar-codigo` | Validar el código |
| POST | `/api/autenticacion/restablecer` | Cambiar la contraseña con el código |
| GET | `/api/visitas/dentro` | Vehículos dentro |
| GET | `/api/visitas/salidas?desde=` | Salidas desde una fecha |
| POST | `/api/visitas` | Registrar entrada |
| POST | `/api/visitas/{id}/salida` | Registrar salida y cobro |
| GET / POST / DELETE | `/api/usuarios`, `/api/usuarios/{id}` | Porteros y administradores |
| GET / PUT | `/api/tarifas`, `/api/tarifas/{tipo}` | Valor hora, tope diario y cupos |
| GET / POST | `/api/turnos/cierres` | Cierres de caja del turno |
| GET | `/api/reportes/recaudo-mensual?anio=` | Recaudo por mes |
| POST | `/api/solicitudes-demo` | Formulario "Solicitar demo" (público) |