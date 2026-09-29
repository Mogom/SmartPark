package co.smartpark.visitantes.web

import co.smartpark.visitantes.dominio.*
import co.smartpark.visitantes.servicio.VisitasServicio
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/visitas")
class VisitasControlador(private val visitas: VisitasServicio) {

    @GetMapping("/dentro")
    fun listarDentro(): List<Vehiculo> = visitas.listarDentro()

    @GetMapping("/salidas")
    fun listarSalidas(@RequestParam desde: Long): List<RegistroSalida> = visitas.listarSalidas(desde)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun registrarEntrada(@RequestBody solicitud: SolicitudEntrada): Vehiculo = visitas.registrarEntrada(solicitud)

    @PostMapping("/{id}/salida")
    fun registrarSalida(@PathVariable id: Long, @RequestBody solicitud: SolicitudSalida): RegistroSalida =
        visitas.registrarSalida(id, solicitud)
}
