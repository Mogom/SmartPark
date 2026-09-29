package co.smartpark.visitantes.servicio

import co.smartpark.repository.ComplexRepository
import co.smartpark.visitantes.dominio.*
import co.smartpark.visitantes.repositorio.CifradorContrasenas
import co.smartpark.visitantes.repositorio.DatosIniciales
import co.smartpark.visitantes.repositorio.SesionesRepositorio
import co.smartpark.visitantes.repositorio.UsuariosRepositorio
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.util.UUID

/** Inicio de sesión, verificación de contraseñas y recuperación con código. */
@Service
class AutenticacionServicio(
    private val usuarios: UsuariosRepositorio,
    private val sesiones: SesionesRepositorio,
    private val conjuntos: ComplexRepository,
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val aleatorio = SecureRandom()

    fun iniciarSesion(credenciales: CredencialesLogin): RespuestaLogin {
        val guardado = usuarios.buscarPorIdentificador(credenciales.usuario)
        if (guardado == null || !CifradorContrasenas.coincide(credenciales.contrasena, guardado)) {
            throw noAutorizado("Usuario o contraseña incorrectos.")
        }
        val token = UUID.randomUUID().toString()
        sesiones.abrir(token, guardado.usuario.id)
        return RespuestaLogin(token, guardado.usuario, nombreSede())
    }

    fun cerrarSesion(token: String?) {
        token?.let(sesiones::cerrar)
    }

    /** Usuario dueño del token, o null si el token no es válido. */
    fun usuarioDeToken(token: String): Usuario? =
        sesiones.usuarioDe(token)?.let { usuarios.buscarPorId(it)?.usuario }

    fun verificarContrasena(nombre: String, contrasena: String): RespuestaVerificacion {
        val guardado = usuarios.buscarPorNombre(nombre)
        return RespuestaVerificacion(guardado != null && CifradorContrasenas.coincide(contrasena, guardado))
    }

    fun verificarAdministrador(contrasena: String): RespuestaVerificacion {
        val administrador = usuarios.listar()
            .filter { it.rol == Rol.ADMINISTRADOR }
            .mapNotNull { usuarios.buscarPorId(it.id) }
            .find { CifradorContrasenas.coincide(contrasena, it) }
        return RespuestaVerificacion(administrador != null, administrador?.usuario?.nombre)
    }

    /**
     * Genera un código de 6 dígitos para recuperar la contraseña.
     * TODO: enviarlo por correo o SMS al contacto del usuario; por ahora solo se escribe en el log.
     */
    fun enviarCodigo(nombre: String) {
        val guardado = usuarios.buscarPorNombre(nombre) ?: throw noEncontrado("No existe un usuario con ese nombre.")
        val codigo = (100_000 + aleatorio.nextInt(900_000)).toString()
        sesiones.guardarCodigo(guardado.usuario.nombre, codigo)
        log.info("Código de recuperación para {}: {}", guardado.usuario.nombre, codigo)
    }

    fun verificarCodigo(nombre: String, codigo: String) =
        RespuestaVerificacion(codigo.isNotBlank() && sesiones.codigoDe(nombre) == codigo)

    fun restablecerContrasena(solicitud: SolicitudRestablecer) {
        if (!verificarCodigo(solicitud.nombre, solicitud.codigo).valido) throw solicitudInvalida("El código no coincide.")
        validarContrasenaNueva(solicitud.contrasenaNueva)
        val guardado = usuarios.buscarPorNombre(solicitud.nombre) ?: throw noEncontrado("No existe un usuario con ese nombre.")
        usuarios.cambiarContrasena(guardado.usuario.id, solicitud.contrasenaNueva)
        sesiones.borrarCodigo(solicitud.nombre)
    }

    private fun nombreSede(): String =
        conjuntos.findById(DatosIniciales.ID_CONJUNTO)?.name ?: "SmartPark"
}

const val LONGITUD_MINIMA_CONTRASENA = 4

fun validarContrasenaNueva(contrasena: String) {
    if (contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
        throw solicitudInvalida("La contraseña debe tener mínimo $LONGITUD_MINIMA_CONTRASENA caracteres.")
    }
}
