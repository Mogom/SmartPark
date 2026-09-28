package co.smartpark.visitantes.dominio

private const val MS_POR_HORA = 3_600_000L

data class ResultadoCobro(val horas: Long, val total: Long, val aplicoTope: Boolean)

/**
 * Regla de cobro: cada hora o fracción iniciada se cobra completa (mínimo 1 hora),
 * con un tope por cada bloque de 24 horas. Es la misma regla que muestra el front.
 */
fun calcularCobro(horaEntrada: Long, horaSalida: Long, valorHora: Long, topeDiario: Long): ResultadoCobro {
    val milisegundos = maxOf(0L, horaSalida - horaEntrada)
    val horas = maxOf(1L, (milisegundos + MS_POR_HORA - 1) / MS_POR_HORA)
    if (topeDiario <= 0) return ResultadoCobro(horas, horas * valorHora, false)
    val dias = horas / 24
    val resto = horas % 24
    val costoResto = minOf(resto * valorHora, topeDiario)
    return ResultadoCobro(horas, dias * topeDiario + costoResto, resto * valorHora > topeDiario || dias > 0)
}
