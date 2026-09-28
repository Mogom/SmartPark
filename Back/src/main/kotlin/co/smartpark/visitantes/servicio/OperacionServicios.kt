package co.smartpark.visitantes.servicio

import co.smartpark.visitantes.dominio.*
import co.smartpark.visitantes.repositorio.*
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.ZoneId

/** Zona horaria de los conjuntos (para agrupar el recaudo por mes). */
private val ZONA_COLOMBIA: ZoneId = ZoneId.of("America/Bogota")

@Service
class TarifasServicio(private val tarifas: TarifasRepositorio) {

    fun obtener(): Map<TipoVehiculo, ConfiguracionTarifa> = tarifas.obtener()

    fun actualizar(tipo: TipoVehiculo, configuracion: ConfiguracionTarifa): ConfiguracionTarifa {
        if (configuracion.valorHora < 0 || configuracion.topeDiario < 0 || configuracion.cupos < 0) {
            throw solicitudInvalida("Los valores de la tarifa no pueden ser negativos.")
        }
        return tarifas.guardar(tipo, configuracion)
    }
}

/** Cierre de caja del turno: el backend calcula los totales a partir de las salidas. */
@Service
class TurnosServicio(
    private val cierres: CierresTurnoRepositorio,
    private val visitas: VisitasRepositorio,
) {
    fun listarCierres(desde: Long): List<CierreTurno> = cierres.listar(desde)

    fun cerrar(solicitud: SolicitudCierreTurno): CierreTurno {
        if (solicitud.porteros.isEmpty()) throw solicitudInvalida("El turno no tiene porteros.")
        val salidas = visitas.listarSalidas(solicitud.inicio)
        fun totalDe(metodo: MetodoPago) = salidas.filter { it.metodoPago == metodo }.sumOf { it.total }
        val efectivo = totalDe(MetodoPago.EFECTIVO)
        val esperado = solicitud.base + efectivo
        val dentro = visitas.listarDentro()
        return cierres.guardar(CierreTurno(
            id = 0, inicio = solicitud.inicio, fin = System.currentTimeMillis(), porteros = solicitud.porteros,
            total = salidas.sumOf { it.total }, efectivo = efectivo,
            tarjeta = totalDe(MetodoPago.TARJETA), transferencia = totalDe(MetodoPago.TRANSFERENCIA),
            base = solicitud.base, esperado = esperado,
            entradas = salidas.size + dentro.count { it.horaEntrada >= solicitud.inicio }, salidas = salidas.size,
            dentro = dentro.size, contado = solicitud.contado, diferencia = solicitud.contado - esperado,
        ))
    }
}

@Service
class ReportesServicio(private val visitas: VisitasRepositorio) {

    /** Recaudo de enero hasta el mes actual. Los meses anteriores son datos de ejemplo hasta tener base de datos. */
    fun recaudoMensual(anio: Int): List<ResumenMes> {
        val hoy = Instant.now().atZone(ZONA_COLOMBIA)
        val ultimoMes = if (anio < hoy.year) 11 else hoy.monthValue - 1
        val salidasPorMes = visitas.listarSalidas(0)
            .map { it to Instant.ofEpochMilli(it.horaSalida).atZone(ZONA_COLOMBIA) }
            .filter { (_, fecha) -> fecha.year == anio }
            .groupBy({ (_, fecha) -> fecha.monthValue - 1 }, { (salida, _) -> salida })

        return (0..ultimoMes).map { mes ->
            val reales = salidasPorMes[mes].orEmpty()
            val (visitasEjemplo, totalEjemplo) =
                if (mes < ultimoMes) DatosIniciales.RECAUDO_MESES_ANTERIORES[mes % DatosIniciales.RECAUDO_MESES_ANTERIORES.size]
                else 0 to 0L
            ResumenMes(mes, visitasEjemplo + reales.size, totalEjemplo + reales.sumOf { it.total })
        }
    }
}

@Service
class SolicitudesDemoServicio(private val solicitudes: SolicitudesDemoRepositorio) {

    fun registrar(solicitud: SolicitudDemo) {
        if (solicitud.nombre.isBlank() || solicitud.conjunto.isBlank() || solicitud.ciudad.isBlank()) {
            throw solicitudInvalida("Faltan datos de la solicitud.")
        }
        if (!solicitud.correo.contains('@')) throw solicitudInvalida("Escribe un correo válido.")
        solicitudes.guardar(solicitud)
    }
}
