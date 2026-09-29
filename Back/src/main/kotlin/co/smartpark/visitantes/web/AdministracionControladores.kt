package co.smartpark.visitantes.web

import co.smartpark.visitantes.dominio.*
import co.smartpark.visitantes.servicio.*
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/usuarios")
class UsuariosControlador(private val usuarios: UsuariosServicio) {

    @GetMapping
    fun listar(): List<Usuario> = usuarios.listar()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun crear(@RequestBody solicitud: SolicitudUsuario): Usuario = usuarios.crear(solicitud)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun eliminar(@PathVariable id: Long) = usuarios.eliminar(id)
}

@RestController
@RequestMapping("/api/tarifas")
class TarifasControlador(private val tarifas: TarifasServicio) {

    @GetMapping
    fun obtener(): Map<TipoVehiculo, ConfiguracionTarifa> = tarifas.obtener()

    @PutMapping("/{tipo}")
    fun actualizar(@PathVariable tipo: TipoVehiculo, @RequestBody configuracion: ConfiguracionTarifa): ConfiguracionTarifa =
        tarifas.actualizar(tipo, configuracion)
}

@RestController
@RequestMapping("/api/turnos")
class TurnosControlador(private val turnos: TurnosServicio) {

    @GetMapping("/cierres")
    fun listarCierres(@RequestParam desde: Long): List<CierreTurno> = turnos.listarCierres(desde)

    @PostMapping("/cierres")
    @ResponseStatus(HttpStatus.CREATED)
    fun cerrar(@RequestBody solicitud: SolicitudCierreTurno): CierreTurno = turnos.cerrar(solicitud)
}

@RestController
@RequestMapping("/api/reportes")
class ReportesControlador(private val reportes: ReportesServicio) {

    @GetMapping("/recaudo-mensual")
    fun recaudoMensual(@RequestParam anio: Int): List<ResumenMes> = reportes.recaudoMensual(anio)
}

@RestController
@RequestMapping("/api/solicitudes-demo")
class SolicitudesDemoControlador(private val solicitudes: SolicitudesDemoServicio) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun registrar(@RequestBody solicitud: SolicitudDemo) = solicitudes.registrar(solicitud)
}
