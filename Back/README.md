# SmartPark Backend

API REST en Spring Boot y Kotlin, con persistencia MongoDB mediante Spring Data MongoDB. Las rutas y respuestas existentes se conservan.

## Ejecutar

Desde la carpeta `SmartPark` para iniciar MongoDB y la API en contenedores:

```bash
docker compose up --build
```

La API queda disponible en `http://localhost:8080`. Los datos de demostracion se insertan al iniciar por primera vez y el volumen `smartpark_mongodb_data` conserva la informacion entre reinicios.

Para ejecutar solo MongoDB en Docker y arrancar la API localmente desde esta carpeta:

```bash
docker compose -f ../docker-compose.yml up -d mongodb
mvn spring-boot:run
```

La URI predeterminada es `mongodb://localhost:27017/smartpark`; se puede cambiar con la variable de entorno `MONGODB_URI`.

## Rutas principales

Todas las rutas empiezan por `/api/v1`:

| Metodo | Ruta                                           | Uso                            |
| ------ | ---------------------------------------------- | ------------------------------ |
| GET    | `/complexes`                                   | Listar conjuntos residenciales |
| GET    | `/complexes/{id}`                              | Consultar un conjunto          |
| GET    | `/residents?complexId=1`                       | Listar residentes              |
| GET    | `/vehicles?complexId=1&residentId=1`           | Listar vehiculos con filtros   |
| GET    | `/parking-spaces?complexId=1&status=AVAILABLE` | Consultar espacios             |
| GET    | `/reservations?complexId=1&status=ACTIVE`      | Consultar reservas             |
| POST   | `/reservations`                                | Crear una reserva              |
| GET    | `/dashboard/summary?complexId=1`               | Indicadores del parqueadero    |

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
