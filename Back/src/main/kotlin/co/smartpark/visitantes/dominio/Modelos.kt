package co.smartpark.visitantes.dominio

/*
 * Modelos del parqueadero de visitantes. Son el contrato JSON con el front
 * (Front/src/app/nucleo/modelos). Las fechas viajan como epoch en milisegundos.
 */

enum class TipoVehiculo { CARRO, MOTO }

enum class MetodoPago { EFECTIVO, TARJETA, TRANSFERENCIA, SIN_COBRO }

enum class Rol { PORTERO, ADMINISTRADOR }

/** Vehículo visitante que está dentro del parqueadero. */
data class Vehiculo(
    val id: Long,
    val placa: String,
    val tipo: TipoVehiculo,
    val nombreVisitante: String,
    val casa: String,
    val telefono: String,
    val registradoPor: String,
    val horaEntrada: Long,
    /** Tarifa con la que entró; no cambia aunque se modifiquen las tarifas después. */
    val valorHora: Long,
    val topeDiario: Long,
)

/** Visita finalizada: vehículo que ya salió y pagó. */
data class RegistroSalida(
    val id: Long,
    val placa: String,
    val tipo: TipoVehiculo,
    val nombreVisitante: String,
    val casa: String,
    val telefono: String,
    val registradoPor: String,
    val horaEntrada: Long,
    val valorHora: Long,
    val topeDiario: Long,
    val horaSalida: Long,
    val horasCobradas: Long,
    val total: Long,
    val aplicoTope: Boolean,
    val metodoPago: MetodoPago,
    val valorRecibido: Long,
    val vueltas: Long,
    val finalizadoPor: String,
)

data class SolicitudEntrada(
    val placa: String,
    val tipo: TipoVehiculo,
    val nombreVisitante: String,
    val casa: String,
    val telefono: String,
    val registradoPor: String,
)

data class SolicitudSalida(
    val metodoPago: MetodoPago,
    val valorRecibido: Long,
    val finalizadoPor: String,
)

/** Usuario tal como se envía al front: nunca incluye la contraseña. */
data class Usuario(
    val id: Long,
    val nombre: String,
    val contacto: String,
    val rol: Rol,
)

data class SolicitudUsuario(
    val nombre: String,
    val contacto: String,
    val contrasena: String,
    val rol: Rol,
)

data class ConfiguracionTarifa(
    val valorHora: Long,
    /** Cobro máximo por cada bloque de 24 horas. */
    val topeDiario: Long,
    val cupos: Int,
)

data class CierreTurno(
    val id: Long,
    val inicio: Long,
    val fin: Long,
    val porteros: List<String>,
    val total: Long,
    val efectivo: Long,
    val tarjeta: Long,
    val transferencia: Long,
    val base: Long,
    val esperado: Long,
    val entradas: Int,
    val salidas: Int,
    val dentro: Int,
    val contado: Long,
    val diferencia: Long,
)

data class SolicitudCierreTurno(
    val inicio: Long,
    val porteros: List<String>,
    val base: Long,
    val contado: Long,
)

data class ResumenMes(
    /** Mes 0–11, como en JavaScript. */
    val mes: Int,
    val visitas: Int,
    val total: Long,
)

data class CredencialesLogin(
    val usuario: String,
    val contrasena: String,
    val recordar: Boolean = false,
)

data class RespuestaLogin(
    val token: String,
    val usuario: Usuario,
    val sede: String,
)

data class SolicitudVerificacion(val nombre: String = "", val contrasena: String = "")

data class SolicitudCodigo(val nombre: String, val codigo: String = "")

data class SolicitudRestablecer(
    val nombre: String,
    val codigo: String,
    val contrasenaNueva: String,
)

data class RespuestaVerificacion(val valido: Boolean, val nombre: String? = null)

data class SolicitudDemo(
    val nombre: String,
    val correo: String,
    val telefono: String,
    val conjunto: String,
    val ciudad: String,
    val tamano: String,
    val mensaje: String = "",
)

/** Cuerpo de todas las respuestas de error: el front muestra `mensaje` al usuario. */
data class RespuestaError(val mensaje: String)
