package co.smartpark.visitantes.servicio

import co.smartpark.visitantes.dominio.Rol
import co.smartpark.visitantes.dominio.SolicitudUsuario
import co.smartpark.visitantes.dominio.Usuario
import co.smartpark.visitantes.repositorio.UsuariosRepositorio
import org.springframework.stereotype.Service

private val PATRON_CORREO = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")

/** Registro y eliminación de porteros y administradores. */
@Service
class UsuariosServicio(private val usuarios: UsuariosRepositorio) {

    fun listar(): List<Usuario> = usuarios.listar()

    fun crear(solicitud: SolicitudUsuario): Usuario {
        val nombre = solicitud.nombre.trim()
        if (nombre.isEmpty()) throw solicitudInvalida("Escribe el nombre del usuario.")
        if (usuarios.buscarPorNombre(nombre) != null) throw conflicto("Ya existe un usuario con ese nombre.")
        val contacto = normalizarContacto(solicitud.contacto)
            ?: throw solicitudInvalida("Escribe un correo válido o un teléfono de 10 dígitos.")
        validarContrasenaNueva(solicitud.contrasena)
        return usuarios.guardar(nombre, contacto, solicitud.rol, solicitud.contrasena)
    }

    fun eliminar(id: Long) {
        val guardado = usuarios.buscarPorId(id) ?: throw noEncontrado("El usuario no existe.")
        val administradores = usuarios.listar().count { it.rol == Rol.ADMINISTRADOR }
        if (guardado.usuario.rol == Rol.ADMINISTRADOR && administradores == 1) {
            throw solicitudInvalida("Debe quedar al menos un usuario de administración.")
        }
        usuarios.eliminar(id)
    }

    /** Correo en minúsculas o teléfono de 10 dígitos; null si no es válido. */
    private fun normalizarContacto(contacto: String): String? {
        val texto = contacto.trim()
        if (PATRON_CORREO.matches(texto)) return texto.lowercase()
        val digitos = texto.filter(Char::isDigit)
        return digitos.takeIf { it.length == 10 }
    }
}
