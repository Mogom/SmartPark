package co.smartpark.visitantes.servicio

import co.smartpark.visitantes.dominio.*
import co.smartpark.visitantes.repositorio.TarifasRepositorio
import co.smartpark.visitantes.repositorio.VisitasRepositorio
import org.springframework.stereotype.Service

/** Formatos de placa en Colombia: carro ABC123, moto ABC12 o ABC12D. */
private val PATRON_PLACA = mapOf(
    TipoVehiculo.CARRO to Regex("^[A-Z]{3}\\d{3}$"),
    TipoVehiculo.MOTO to Regex("^[A-Z]{3}\\d{2}[A-Z]?$"),
)

/** Entradas y salidas de vehículos visitantes, con el cálculo del cobro. */
@Service
class VisitasServicio(
    private val visitas: VisitasRepositorio,
    private val tarifas: TarifasRepositorio,
) {
    fun listarDentro(): List<Vehiculo> = visitas.listarDentro()

    fun listarSalidas(desde: Long): List<RegistroSalida> = visitas.listarSalidas(desde)

    fun registrarEntrada(solicitud: SolicitudEntrada): Vehiculo {
        val placa = solicitud.placa.trim().uppercase().replace(" ", "")
        if (!PATRON_PLACA.getValue(solicitud.tipo).matches(placa)) {
            throw solicitudInvalida(
                if (solicitud.tipo == TipoVehiculo.CARRO) "Placa de carro no válida. Formato: ABC123."
                else "Placa de moto no válida. Formato: ABC12D.")
        }
        if (solicitud.nombreVisitante.isBlank()) throw solicitudInvalida("Falta el nombre del visitante.")
        if (solicitud.casa.isBlank()) throw solicitudInvalida("Falta la casa a la que va.")
        if (solicitud.telefono.filter(Char::isDigit).length != 10) throw solicitudInvalida("El teléfono debe tener 10 dígitos.")
        if (solicitud.registradoPor.isBlank()) throw solicitudInvalida("Elige los porteros de turno antes de registrar.")
        if (visitas.buscarDentroPorPlaca(placa) != null) throw conflicto("$placa ya está registrado dentro.")

        val tarifa = tarifas.obtener(solicitud.tipo)
        return visitas.guardarEntrada(Vehiculo(
            id = 0, placa = placa, tipo = solicitud.tipo, nombreVisitante = solicitud.nombreVisitante.trim(),
            casa = solicitud.casa.trim(), telefono = solicitud.telefono.filter(Char::isDigit),
            registradoPor = solicitud.registradoPor, horaEntrada = System.currentTimeMillis(),
            valorHora = tarifa.valorHora, topeDiario = tarifa.topeDiario,
        ))
    }

    fun registrarSalida(idVehiculo: Long, solicitud: SolicitudSalida): RegistroSalida {
        val vehiculo = visitas.buscarDentro(idVehiculo) ?: throw noEncontrado("El vehículo ya no está dentro.")
        val horaSalida = System.currentTimeMillis()
        val cobro = calcularCobro(vehiculo.horaEntrada, horaSalida, vehiculo.valorHora, vehiculo.topeDiario)
        val efectivo = solicitud.metodoPago == MetodoPago.EFECTIVO
        val recibido = if (efectivo && cobro.total > 0) solicitud.valorRecibido else 0
        if (efectivo && recibido < cobro.total) throw solicitudInvalida("El valor recibido es menor al total.")

        return visitas.guardarSalida(RegistroSalida(
            id = vehiculo.id, placa = vehiculo.placa, tipo = vehiculo.tipo, nombreVisitante = vehiculo.nombreVisitante,
            casa = vehiculo.casa, telefono = vehiculo.telefono, registradoPor = vehiculo.registradoPor,
            horaEntrada = vehiculo.horaEntrada, valorHora = vehiculo.valorHora, topeDiario = vehiculo.topeDiario,
            horaSalida = horaSalida, horasCobradas = cobro.horas, total = cobro.total, aplicoTope = cobro.aplicoTope,
            metodoPago = if (cobro.total == 0L) MetodoPago.SIN_COBRO else solicitud.metodoPago,
            valorRecibido = recibido, vueltas = if (efectivo) recibido - cobro.total else 0,
            finalizadoPor = solicitud.finalizadoPor,
        ))
    }
}
