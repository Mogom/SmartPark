package co.smartpark.repository

import co.smartpark.domain.*
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.concurrent.atomic.AtomicLong

@Repository
class ComplexRepository {
    private val complexes = listOf(
        ResidentialComplex(1, "Conjunto Los Cedros", "Carrera 15 # 102-20", 36),
        ResidentialComplex(2, "Torres del Parque", "Calle 80 # 20-11", 52)
    )

    fun findAll(): List<ResidentialComplex> = complexes
    fun findById(id: Long): ResidentialComplex? = complexes.find { it.id == id }
}

@Repository
class ResidentRepository {
    private val residents = listOf(
        Resident(1, "Laura Martinez", "Torre 1 - 402", "laura.martinez@example.com", 1),
        Resident(2, "Andres Gomez", "Torre 2 - 1103", "andres.gomez@example.com", 1),
        Resident(3, "Camila Rojas", "Torre A - 605", "camila.rojas@example.com", 2)
    )

    fun findAll(complexId: Long?): List<Resident> = residents.filter { complexId == null || it.complexId == complexId }
    fun exists(id: Long): Boolean = residents.any { it.id == id }
}

@Repository
class VehicleRepository {
    private val vehicles = listOf(
        Vehicle(1, "ABC123", VehicleType.CAR, "Mazda 3", "Blanco", 1, 1),
        Vehicle(2, "MTR45F", VehicleType.MOTORCYCLE, "Yamaha", "Negro", 2, 1),
        Vehicle(3, "XYZ789", VehicleType.CAR, "Renault Duster", "Gris", 3, 2)
    )

    fun findAll(complexId: Long?, residentId: Long?): List<Vehicle> = vehicles.filter {
        (complexId == null || it.complexId == complexId) && (residentId == null || it.residentId == residentId)
    }

    fun exists(id: Long): Boolean = vehicles.any { it.id == id }
}

@Repository
class ParkingSpaceRepository {
    private val spaces = (1L..10L).map { id ->
        ParkingSpace(id, "P-${id.toString().padStart(2, '0')}", if (id <= 5) 1 else 2,
            when (id) {
                2L, 7L -> ParkingSpaceStatus.OCCUPIED
                4L -> ParkingSpaceStatus.RESERVED
                else -> ParkingSpaceStatus.AVAILABLE
            }, if (id <= 6) 1 else 2, if (id == 2L) 1 else null)
    }

    fun findAll(complexId: Long?, status: ParkingSpaceStatus?): List<ParkingSpace> = spaces.filter {
        (complexId == null || it.complexId == complexId) && (status == null || it.status == status)
    }

    fun exists(id: Long): Boolean = spaces.any { it.id == id }
}

@Repository
class ReservationRepository {
    private val sequence = AtomicLong(3)
    private val reservations = mutableListOf(
        Reservation(1, 4, 1, 1, 1, LocalDateTime.now().minusHours(1), LocalDateTime.now().plusHours(2), ReservationStatus.ACTIVE),
        Reservation(2, 7, 3, 3, 2, LocalDateTime.now().plusHours(3), LocalDateTime.now().plusHours(5), ReservationStatus.PENDING)
    )

    fun findAll(complexId: Long?, status: ReservationStatus?): List<Reservation> = synchronized(reservations) {
        reservations.filter { (complexId == null || it.complexId == complexId) && (status == null || it.status == status) }
    }

    fun save(request: CreateReservationRequest): Reservation = synchronized(reservations) {
        val reservation = Reservation(sequence.incrementAndGet(), request.parkingSpaceId, request.vehicleId,
            request.residentId, request.complexId, request.startsAt, request.endsAt, ReservationStatus.PENDING)
        reservations.add(reservation)
        reservation
    }
}