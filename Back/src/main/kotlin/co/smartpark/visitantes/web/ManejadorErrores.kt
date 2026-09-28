package co.smartpark.visitantes.web

import co.smartpark.visitantes.dominio.RespuestaError
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.server.ResponseStatusException

/** Convierte los errores de las rutas de visitantes en { "mensaje": "..." }, que es lo que muestra el front. */
@RestControllerAdvice(basePackages = ["co.smartpark.visitantes"])
class ManejadorErrores {
    private val log = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(ResponseStatusException::class)
    fun estado(error: ResponseStatusException): ResponseEntity<RespuestaError> =
        ResponseEntity.status(error.statusCode).body(RespuestaError(error.reason ?: "No se pudo completar la operación."))

    @ExceptionHandler(HttpMessageNotReadableException::class, MissingServletRequestParameterException::class, MethodArgumentTypeMismatchException::class)
    fun solicitudMalFormada(error: Exception): ResponseEntity<RespuestaError> =
        ResponseEntity.badRequest().body(RespuestaError("Los datos enviados no tienen el formato esperado."))

    @ExceptionHandler(Exception::class)
    fun inesperado(error: Exception): ResponseEntity<RespuestaError> {
        log.error("Error inesperado", error)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(RespuestaError("Ocurrió un error en el servidor. Intenta de nuevo."))
    }
}
