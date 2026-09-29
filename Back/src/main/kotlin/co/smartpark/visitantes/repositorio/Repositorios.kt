package co.smartpark.visitantes.repositorio

import co.smartpark.visitantes.dominio.*
import org.springframework.stereotype.Repository
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicLong

/*
 * Repositorios en memoria del parqueadero de visitantes. Los datos se reinician al
 * reiniciar la aplicación. Al conectar la base de datos se reemplazan por repositorios
 * JPA sin cambiar servicios ni controladores.
 */

/** Usuario con su contraseña cifrada; solo existe dentro del backend. */
data class UsuarioGuardado(val usuario: Usuario, val sal: String, val hashContrasena: String)

/**
 * Cifrado de contraseñas con SHA-256 y sal aleatoria.
 * Para producción usar BCrypt (spring-security-crypto).
 */
object CifradorContrasenas {
    private val aleatorio = SecureRandom()

    fun nuevaSal(): String = ByteArray(16).also(aleatorio::nextBytes).let(Base64.getEncoder()::encodeToString)

    fun cifrar(contrasena: String, sal: String): String =
        MessageDigest.getInstance("SHA-256").digest((sal + contrasena).toByteArray())
            .let(Base64.getEncoder()::encodeToString)

    fun coincide(contrasena: String, guardado: UsuarioGuardado): Boolean =
        MessageDigest.isEqual(cifrar(contrasena, guardado.sal).toByteArray(), guardado.hashContrasena.toByteArray())
}

@Repository
class UsuariosRepositorio {
    private val usuarios = CopyOnWriteArrayList<UsuarioGuardado>()
    private val siguienteId = AtomicLong(1)

    init {
        DatosIniciales.USUARIOS.forEach { (nombre, contacto, rol, contrasena) -> guardar(nombre, contacto, rol, contrasena) }
    }

    fun listar(): List<Usuario> = usuarios.map { it.usuario }
    fun buscarPorId(id: Long): UsuarioGuardado? = usuarios.find { it.usuario.id == id }
    fun buscarPorNombre(nombre: String): UsuarioGuardado? = usuarios.find { it.usuario.nombre.equals(nombre.trim(), ignoreCase = true) }

    /** Busca por nombre o por contacto (correo o teléfono). */
    fun buscarPorIdentificador(identificador: String): UsuarioGuardado? = identificador.trim().let { id ->
        usuarios.find { it.usuario.nombre.equals(id, ignoreCase = true) || it.usuario.contacto.equals(id, ignoreCase = true) }
    }

    fun guardar(nombre: String, contacto: String, rol: Rol, contrasena: String): Usuario {
        val sal = CifradorContrasenas.nuevaSal()
        val usuario = Usuario(siguienteId.getAndIncrement(), nombre, contacto, rol)
        usuarios.add(UsuarioGuardado(usuario, sal, CifradorContrasenas.cifrar(contrasena, sal)))
        return usuario
    }

    fun cambiarContrasena(id: Long, contrasena: String) {
        val indice = usuarios.indexOfFirst { it.usuario.id == id }
        if (indice < 0) return
        val sal = CifradorContrasenas.nuevaSal()
        usuarios[indice] = usuarios[indice].copy(sal = sal, hashContrasena = CifradorContrasenas.cifrar(contrasena, sal))
    }

    fun eliminar(id: Long) = usuarios.removeIf { it.usuario.id == id }
}

@Repository
class VisitasRepositorio {
    private val dentro = CopyOnWriteArrayList<Vehiculo>()
    private val salidas = CopyOnWriteArrayList<RegistroSalida>()
    private val siguienteId = AtomicLong(101)

    init {
        val ahora = System.currentTimeMillis()
        DatosIniciales.vehiculosDentro(ahora).forEach { dentro.add(it.copy(id = siguienteId.getAndIncrement())) }
        DatosIniciales.salidas(ahora).forEach { salidas.add(it.copy(id = siguienteId.getAndIncrement())) }
    }

    fun listarDentro(): List<Vehiculo> = dentro.toList()
    fun buscarDentro(id: Long): Vehiculo? = dentro.find { it.id == id }
    fun buscarDentroPorPlaca(placa: String): Vehiculo? = dentro.find { it.placa == placa }
    fun listarSalidas(desde: Long): List<RegistroSalida> = salidas.filter { it.horaSalida >= desde }

    fun guardarEntrada(vehiculo: Vehiculo): Vehiculo = vehiculo.copy(id = siguienteId.getAndIncrement()).also { dentro.add(0, it) }

    fun guardarSalida(registro: RegistroSalida): RegistroSalida {
        dentro.removeIf { it.id == registro.id }
        salidas.add(0, registro)
        return registro
    }
}

@Repository
class TarifasRepositorio {
    private val tarifas = ConcurrentHashMap(DatosIniciales.TARIFAS)

    fun obtener(): Map<TipoVehiculo, ConfiguracionTarifa> = TipoVehiculo.entries.associateWith { tarifas.getValue(it) }
    fun obtener(tipo: TipoVehiculo): ConfiguracionTarifa = tarifas.getValue(tipo)
    fun guardar(tipo: TipoVehiculo, configuracion: ConfiguracionTarifa): ConfiguracionTarifa = configuracion.also { tarifas[tipo] = it }
}

@Repository
class CierresTurnoRepositorio {
    private val cierres = CopyOnWriteArrayList<CierreTurno>()
    private val siguienteId = AtomicLong(1)

    fun listar(desde: Long): List<CierreTurno> = cierres.filter { it.fin >= desde }
    fun guardar(cierre: CierreTurno): CierreTurno = cierre.copy(id = siguienteId.getAndIncrement()).also { cierres.add(0, it) }
}

@Repository
class SolicitudesDemoRepositorio {
    private val solicitudes = CopyOnWriteArrayList<SolicitudDemo>()

    fun guardar(solicitud: SolicitudDemo) = solicitudes.add(solicitud)
    fun listar(): List<SolicitudDemo> = solicitudes.toList()
}

/** Sesiones abiertas (token → id de usuario) y códigos de recuperación pendientes. */
@Repository
class SesionesRepositorio {
    private val sesiones = ConcurrentHashMap<String, Long>()
    private val codigos = ConcurrentHashMap<String, String>()

    fun abrir(token: String, idUsuario: Long) { sesiones[token] = idUsuario }
    fun usuarioDe(token: String): Long? = sesiones[token]
    fun cerrar(token: String) { sesiones.remove(token) }

    fun guardarCodigo(nombre: String, codigo: String) { codigos[nombre.lowercase()] = codigo }
    fun codigoDe(nombre: String): String? = codigos[nombre.lowercase()]
    fun borrarCodigo(nombre: String) { codigos.remove(nombre.lowercase()) }
}
