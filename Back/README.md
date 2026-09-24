# SmartPark Backend

API REST en Spring Boot y Kotlin. Actualmente usa repositorios en memoria para que el frontend pueda avanzar sin una base de datos. Los controladores dependen de servicios y repositorios, por lo que la futura integracion con PostgreSQL puede reemplazar las implementaciones mock sin cambiar las rutas.

## Ejecutar

Desde esta carpeta:

```bash
mvn spring-boot:run
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