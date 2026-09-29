package co.smartpark.visitantes.repositorio

import co.smartpark.visitantes.dominio.*

/** Datos de ejemplo con los que arranca el backend mientras no hay base de datos. */
object DatosIniciales {
    private const val MS_POR_MINUTO = 60_000L

    /** Id del conjunto (ver ComplexRepository) al que pertenece este parqueadero de visitantes. */
    const val ID_CONJUNTO = 1L

    val TARIFAS = mapOf(
        TipoVehiculo.CARRO to ConfiguracionTarifa(valorHora = 3500, topeDiario = 25000, cupos = 40),
        TipoVehiculo.MOTO to ConfiguracionTarifa(valorHora = 1500, topeDiario = 10000, cupos = 20),
    )

    data class UsuarioInicial(val nombre: String, val contacto: String, val rol: Rol, val contrasena: String)

    val USUARIOS = listOf(
        UsuarioInicial("Carlos Mejía", "3004521877", Rol.PORTERO, "1234"),
        UsuarioInicial("Diana Rojas", "diana.rojas@gmail.com", Rol.PORTERO, "5678"),
        UsuarioInicial("Luis Herrera", "3157749020", Rol.PORTERO, "0000"),
        UsuarioInicial("Martha Gómez", "martha.gomez@altosdelparque.co", Rol.ADMINISTRADOR, "9999"),
    )

    fun vehiculosDentro(ahora: Long): List<Vehiculo> = listOf(
        dentro("KDM482", TipoVehiculo.CARRO, "Sofía Herrera", "Casa 14", "3004521877", 47, "Carlos Mejía", ahora),
        dentro("MXR19F", TipoVehiculo.MOTO, "Juan Pablo Ríos", "Casa 31", "3157749020", 133, "Diana Rojas", ahora),
        dentro("BTQ775", TipoVehiculo.CARRO, "Mariana López", "Casa 8", "3209981432", 185, "Carlos Mejía", ahora),
        dentro("WEP90C", TipoVehiculo.MOTO, "Esteban Cano", "Casa 22", "3012245566", 62, "Diana Rojas", ahora),
        dentro("JNE640", TipoVehiculo.CARRO, "Valentina Mora", "Casa 5", "3168823311", 18, "Carlos Mejía", ahora),
    )

    fun salidas(ahora: Long): List<RegistroSalida> = listOf(
        salida("UVW230", TipoVehiculo.CARRO, "Ricardo Salas", "Casa 3", "3105567788", 520, 410, MetodoPago.EFECTIVO, 10000, "Carlos Mejía", "Carlos Mejía", ahora),
        salida("RTY56E", TipoVehiculo.MOTO, "Paula Castaño", "Casa 19", "3003321100", 480, 455, MetodoPago.TRANSFERENCIA, 0, "Carlos Mejía", "Diana Rojas", ahora),
        salida("AAB123", TipoVehiculo.CARRO, "Felipe Duarte", "Casa 27", "3124456677", 400, 215, MetodoPago.TARJETA, 0, "Diana Rojas", "Diana Rojas", ahora),
        salida("LMN842", TipoVehiculo.CARRO, "Natalia Gil", "Casa 11", "3019987766", 300, 262, MetodoPago.EFECTIVO, 5000, "Carlos Mejía", "Carlos Mejía", ahora),
        salida("QWE71D", TipoVehiculo.MOTO, "Andrés Beltrán", "Casa 2", "3176654433", 260, 95, MetodoPago.EFECTIVO, 5000, "Diana Rojas", "Carlos Mejía", ahora),
        salida("PKO455", TipoVehiculo.CARRO, "Laura Quintero", "Casa 16", "3143322110", 150, 72, MetodoPago.EFECTIVO, 20000, "Diana Rojas", "Diana Rojas", ahora),
        salida("GHT318", TipoVehiculo.CARRO, "Mateo Vargas", "Casa 9", "3051122334", 110, 40, MetodoPago.TRANSFERENCIA, 0, "Carlos Mejía", "Diana Rojas", ahora),
    )

    /** [visitas, recaudo] de meses anteriores al actual (enero en adelante). */
    val RECAUDO_MESES_ANTERIORES = listOf(
        612 to 1_842_500L, 578 to 1_731_000L, 655 to 1_968_000L, 630 to 1_895_500L, 701 to 2_104_000L, 668 to 2_010_500L,
        742 to 2_233_000L, 719 to 2_167_500L, 690 to 2_080_000L, 705 to 2_121_000L, 760 to 2_290_000L,
    )

    private fun dentro(
        placa: String, tipo: TipoVehiculo, visitante: String, casa: String, telefono: String,
        minutosDentro: Long, registradoPor: String, ahora: Long,
    ): Vehiculo {
        val tarifa = TARIFAS.getValue(tipo)
        return Vehiculo(0, placa, tipo, visitante, casa, telefono, registradoPor,
            ahora - minutosDentro * MS_POR_MINUTO, tarifa.valorHora, tarifa.topeDiario)
    }

    private fun salida(
        placa: String, tipo: TipoVehiculo, visitante: String, casa: String, telefono: String,
        minutosDesdeEntrada: Long, minutosDesdeSalida: Long, metodoPago: MetodoPago, recibido: Long,
        registradoPor: String, finalizadoPor: String, ahora: Long,
    ): RegistroSalida {
        val tarifa = TARIFAS.getValue(tipo)
        val horaEntrada = ahora - minutosDesdeEntrada * MS_POR_MINUTO
        val horaSalida = ahora - minutosDesdeSalida * MS_POR_MINUTO
        val cobro = calcularCobro(horaEntrada, horaSalida, tarifa.valorHora, tarifa.topeDiario)
        val efectivo = metodoPago == MetodoPago.EFECTIVO
        return RegistroSalida(0, placa, tipo, visitante, casa, telefono, registradoPor, horaEntrada, tarifa.valorHora,
            tarifa.topeDiario, horaSalida, cobro.horas, cobro.total, cobro.aplicoTope, metodoPago,
            if (efectivo) recibido else 0, if (efectivo) recibido - cobro.total else 0, finalizadoPor)
    }
}
