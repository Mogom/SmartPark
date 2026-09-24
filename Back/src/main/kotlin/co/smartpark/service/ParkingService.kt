package co.smartpark.service

import co.smartpark.domain.*
import co.smartpark.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class ParkingService(
    private val complexes: ComplexRepository,
    private val residents: ResidentRepository,
    private val vehicles: VehicleRepository,
    private val spaces: ParkingSpaceRepository,
    private val reservations: ReservationRepository
) {
    fun allComplexes() = complexes.findAll()
    fun complex(id: Long) = complexes.findById(id) ?: throw notFound("Conjunto no encontrado")
    fun allResidents(complexId: Long?) = residents.findAll(complexId)
    fun allVehicles(complexId: Long?, residentId: Long?) = vehicles.findAll(complexId, residentId)
    fun allSpaces(complexId: Long?, status: ParkingSpaceStatus?) = spaces.findAll(complexId, status)
    fun allReservations(complexId: Long?, status: ReservationStatus?) = reservations.findAll(complexId, status)

    fun createReservation(request: CreateReservationRequest): Reservation {
        if (!complexes.findById(request.complexId).let { it != null }) throw notFound("Conjunto no encontrado")
        if (!spaces.exists(request.parkingSpaceId)) throw notFound("Espacio de parqueadero no encontrado")
        if (!vehicles.exists(request.vehicleId)) throw notFound("Vehiculo no encontrado")
        if (!residents.exists(request.residentId)) throw notFound("Residente no encontrado")
        if (!request.endsAt.isAfter(request.startsAt)) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "endsAt debe ser posterior a startsAt")
        return reservations.save(request)
    }

    fun summary(complexId: Long): DashboardSummary {
        val complex = complex(complexId)
        val spacesForComplex = spaces.findAll(complex.id, null)
        return DashboardSummary(complex.id, complex.totalParkingSpaces,
            spacesForComplex.count { it.status == ParkingSpaceStatus.AVAILABLE },
            spacesForComplex.count { it.status == ParkingSpaceStatus.OCCUPIED },
            spacesForComplex.count { it.status == ParkingSpaceStatus.RESERVED },
            reservations.findAll(complex.id, ReservationStatus.ACTIVE).size)
    }

    private fun notFound(message: String) = ResponseStatusException(HttpStatus.NOT_FOUND, message)
}