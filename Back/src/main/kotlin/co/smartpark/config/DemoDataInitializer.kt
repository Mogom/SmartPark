package co.smartpark.config

import co.smartpark.domain.*
import co.smartpark.repository.SequenceCounter
import org.springframework.boot.CommandLineRunner
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class DemoDataInitializer(private val mongo: MongoTemplate) : CommandLineRunner {
    override fun run(vararg args: String?) {
        seedIfEmpty(listOf(
            ResidentialComplex(1, "Conjunto Los Cedros", "Carrera 15 # 102-20", 36),
            ResidentialComplex(2, "Torres del Parque", "Calle 80 # 20-11", 52)
        ))
        seedIfEmpty(listOf(
            Resident(1, "Laura Martinez", "Torre 1 - 402", "laura.martinez@example.com", 1),
            Resident(2, "Andres Gomez", "Torre 2 - 1103", "andres.gomez@example.com", 1),
            Resident(3, "Camila Rojas", "Torre A - 605", "camila.rojas@example.com", 2)
        ))
        seedIfEmpty(listOf(
            Vehicle(1, "ABC123", VehicleType.CAR, "Mazda 3", "Blanco", 1, 1),
            Vehicle(2, "MTR45F", VehicleType.MOTORCYCLE, "Yamaha", "Negro", 2, 1),
            Vehicle(3, "XYZ789", VehicleType.CAR, "Renault Duster", "Gris", 3, 2)
        ))
        seedIfEmpty((1L..10L).map { id ->
            ParkingSpace(
                id,
                "P-${id.toString().padStart(2, '0')}",
                if (id <= 5) 1 else 2,
                when (id) {
                    2L, 7L -> ParkingSpaceStatus.OCCUPIED
                    4L -> ParkingSpaceStatus.RESERVED
                    else -> ParkingSpaceStatus.AVAILABLE
                },
                if (id <= 6) 1 else 2,
                if (id == 2L) 1 else null
            )
        })
        seedIfEmpty(listOf(
            Reservation(1, 4, 1, 1, 1, LocalDateTime.now().minusHours(1), LocalDateTime.now().plusHours(2), ReservationStatus.ACTIVE),
            Reservation(2, 7, 3, 3, 2, LocalDateTime.now().plusHours(3), LocalDateTime.now().plusHours(5), ReservationStatus.PENDING)
        ))

        val counterQuery = Query.query(Criteria.where("_id").`is`("reservation"))
        if (!mongo.exists(counterQuery, SequenceCounter::class.java)) {
            val currentMaximumId = mongo.findAll(Reservation::class.java).maxOfOrNull { it.id } ?: 0
            mongo.insert(SequenceCounter("reservation", currentMaximumId))
        }
    }

    private fun <T : Any> seedIfEmpty(records: List<T>) {
        val type = records.firstOrNull()?.javaClass ?: return
        if (mongo.count(Query(), type) == 0L) mongo.insertAll(records)
    }
}