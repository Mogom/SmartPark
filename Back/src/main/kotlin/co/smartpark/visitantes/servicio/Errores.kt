package co.smartpark.visitantes.servicio

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

fun solicitudInvalida(mensaje: String) = ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje)
fun noEncontrado(mensaje: String) = ResponseStatusException(HttpStatus.NOT_FOUND, mensaje)
fun conflicto(mensaje: String) = ResponseStatusException(HttpStatus.CONFLICT, mensaje)
fun noAutorizado(mensaje: String) = ResponseStatusException(HttpStatus.UNAUTHORIZED, mensaje)
