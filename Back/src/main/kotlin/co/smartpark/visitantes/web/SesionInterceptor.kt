package co.smartpark.visitantes.web

import co.smartpark.visitantes.servicio.AutenticacionServicio
import com.fasterxml.jackson.databind.ObjectMapper
import co.smartpark.visitantes.dominio.RespuestaError
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/** Exige un token de sesión válido (Authorization: Bearer ...) en las rutas privadas del parqueadero de visitantes. */
class SesionInterceptor(
    private val autenticacion: AutenticacionServicio,
    private val json: ObjectMapper,
) : HandlerInterceptor {

    override fun preHandle(peticion: HttpServletRequest, respuesta: HttpServletResponse, handler: Any): Boolean {
        if (peticion.method == "OPTIONS") return true
        val token = tokenDe(peticion.getHeader(HttpHeaders.AUTHORIZATION))
        if (token != null && autenticacion.usuarioDeToken(token) != null) return true

        respuesta.status = HttpServletResponse.SC_UNAUTHORIZED
        respuesta.contentType = MediaType.APPLICATION_JSON_VALUE
        respuesta.characterEncoding = Charsets.UTF_8.name()
        json.writeValue(respuesta.writer, RespuestaError("Tu sesión terminó. Inicia sesión de nuevo."))
        return false
    }
}

@Configuration(proxyBeanMethods = false)
class SesionConfig(
    private val autenticacion: AutenticacionServicio,
    private val json: ObjectMapper,
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(SesionInterceptor(autenticacion, json))
            .addPathPatterns(
                "/api/visitas/**", "/api/usuarios/**", "/api/tarifas/**", "/api/turnos/**", "/api/reportes/**",
                "/api/autenticacion/**",
            )
            // Rutas públicas: iniciar sesión y el formulario del landing (/api/solicitudes-demo no está en la lista).
            .excludePathPatterns("/api/autenticacion/login")
    }
}
