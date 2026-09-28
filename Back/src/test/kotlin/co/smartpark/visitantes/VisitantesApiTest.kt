package co.smartpark.visitantes

import co.smartpark.visitantes.dominio.calcularCobro
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActionsDsl
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class VisitantesApiTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val json: ObjectMapper,
) {
    private fun ResultActionsDsl.cuerpo(): JsonNode = json.readTree(andReturn().response.contentAsString)

    private fun iniciarSesion(usuario: String = "Martha Gómez", contrasena: String = "9999"): String =
        mvc.post("/api/autenticacion/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"usuario":"$usuario","contrasena":"$contrasena","recordar":false}"""
        }.andExpect { status { isOk() } }.cuerpo()["token"].asText()

    @Test
    fun `el cobro es por hora o fraccion con tope cada 24 horas`() {
        val hora = 3_600_000L
        assertEquals(3500, calcularCobro(0, 1, 3500, 25000).total)            // 1 ms → 1 hora
        assertEquals(7000, calcularCobro(0, hora + 1, 3500, 25000).total)     // 1 h y algo → 2 horas
        val diaCompleto = calcularCobro(0, 10 * hora, 3500, 25000)            // 35.000 > tope
        assertEquals(25000, diaCompleto.total)
        assertTrue(diaCompleto.aplicoTope)
    }

    @Test
    fun `las rutas privadas exigen sesion`() {
        mvc.get("/api/visitas/dentro").andExpect {
            status { isUnauthorized() }
            jsonPath("$.mensaje") { exists() }
        }
    }

    @Test
    fun `login con contrasena incorrecta devuelve 401 con mensaje`() {
        mvc.post("/api/autenticacion/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"usuario":"Martha Gómez","contrasena":"mala"}"""
        }.andExpect {
            status { isUnauthorized() }
            jsonPath("$.mensaje") { value("Usuario o contraseña incorrectos.") }
        }
    }

    @Test
    fun `flujo completo de entrada, salida y cierre de turno`() {
        val token = iniciarSesion()
        val inicioTurno = System.currentTimeMillis() - 1000

        val entrada = mvc.post("/api/visitas") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = """{"placa":"TST123","tipo":"CARRO","nombreVisitante":"Prueba","casa":"Casa 1","telefono":"3001234567","registradoPor":"Carlos Mejía"}"""
        }.andExpect {
            status { isCreated() }
            jsonPath("$.valorHora") { value(3500) }
        }.cuerpo()

        mvc.post("/api/visitas/${entrada["id"].asLong()}/salida") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = """{"metodoPago":"EFECTIVO","valorRecibido":5000,"finalizadoPor":"Carlos Mejía"}"""
        }.andExpect {
            status { isOk() }
            jsonPath("$.total") { value(3500) }
            jsonPath("$.vueltas") { value(1500) }
        }

        mvc.post("/api/turnos/cierres") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = """{"inicio":$inicioTurno,"porteros":["Carlos Mejía"],"base":100000,"contado":103500}"""
        }.andExpect {
            status { isCreated() }
            jsonPath("$.esperado") { value(103500) }
            jsonPath("$.diferencia") { value(0) }
        }
    }

    @Test
    fun `placa repetida devuelve 409`() {
        val token = iniciarSesion()
        mvc.post("/api/visitas") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = """{"placa":"KDM482","tipo":"CARRO","nombreVisitante":"X","casa":"Casa 2","telefono":"3001234567","registradoPor":"Carlos Mejía"}"""
        }.andExpect {
            status { isConflict() }
            jsonPath("$.mensaje") { value("KDM482 ya está registrado dentro.") }
        }
    }

    @Test
    fun `el formulario del landing es publico`() {
        mvc.post("/api/solicitudes-demo") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"nombre":"Ana","correo":"ana@correo.com","telefono":"3001234567","conjunto":"Los Pinos","ciudad":"Bogotá","tamano":"1–20"}"""
        }.andExpect { status { isCreated() } }
    }

    @Test
    fun `las rutas del mock original siguen funcionando`() {
        mvc.get("/api/v1/complexes").andExpect { status { isOk() } }
    }
}
