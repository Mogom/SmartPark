package co.smartpark.visitantes.web

import co.smartpark.visitantes.dominio.*
import co.smartpark.visitantes.servicio.AutenticacionServicio
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/autenticacion")
class AutenticacionControlador(private val autenticacion: AutenticacionServicio) {

    @PostMapping("/login")
    fun iniciarSesion(@RequestBody credenciales: CredencialesLogin): RespuestaLogin =
        autenticacion.iniciarSesion(credenciales)

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun cerrarSesion(@RequestHeader(HttpHeaders.AUTHORIZATION, required = false) autorizacion: String?) =
        autenticacion.cerrarSesion(tokenDe(autorizacion))

    @PostMapping("/verificar")
    fun verificarContrasena(@RequestBody solicitud: SolicitudVerificacion): RespuestaVerificacion =
        autenticacion.verificarContrasena(solicitud.nombre, solicitud.contrasena)

    @PostMapping("/verificar-administrador")
    fun verificarAdministrador(@RequestBody solicitud: SolicitudVerificacion): RespuestaVerificacion =
        autenticacion.verificarAdministrador(solicitud.contrasena)

    @PostMapping("/codigo")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun enviarCodigo(@RequestBody solicitud: SolicitudCodigo) = autenticacion.enviarCodigo(solicitud.nombre)

    @PostMapping("/verificar-codigo")
    fun verificarCodigo(@RequestBody solicitud: SolicitudCodigo): RespuestaVerificacion =
        autenticacion.verificarCodigo(solicitud.nombre, solicitud.codigo)

    @PostMapping("/restablecer")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun restablecerContrasena(@RequestBody solicitud: SolicitudRestablecer) = autenticacion.restablecerContrasena(solicitud)
}

/** "Bearer abc" → "abc" */
fun tokenDe(autorizacion: String?): String? =
    autorizacion?.takeIf { it.startsWith("Bearer ", ignoreCase = true) }?.substring(7)?.trim()?.ifEmpty { null }
