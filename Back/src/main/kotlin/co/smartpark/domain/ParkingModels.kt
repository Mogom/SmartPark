package co.smartpark.domain

import java.time.LocalDateTime
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

enum class ParkingSpaceStatus { AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE }
enum class VehicleType { CAR, MOTORCYCLE, BICYCLE }
enum class ReservationStatus { PENDING, ACTIVE, COMPLETED, CANCELLED }

@Document("complexes")
data class ResidentialComplex(
    @Id
    val id: Long,
    val name: String,
    val address: String,
    val totalParkingSpaces: Int
)

@Document("residents")
data class Resident(
    @Id
    val id: Long,
    val fullName: String,
    val apartment: String,
    val email: String,
    @Indexed
    val complexId: Long
)

@Document("vehicles")
@CompoundIndex(name = "vehicle_complex_resident_idx", def = "{'complexId': 1, 'residentId': 1}")
data class Vehicle(
    @Id
    val id: Long,
    @Indexed(unique = true)
    val plate: String,
    val type: VehicleType,
    val brand: String,
    val color: String,
    val residentId: Long,
    val complexId: Long
)

@Document("parking_spaces")
@CompoundIndex(name = "space_complex_status_idx", def = "{'complexId': 1, 'status': 1}")
data class ParkingSpace(
    @Id
    val id: Long,
    val code: String,
    val floor: Int,
    val status: ParkingSpaceStatus,
    val complexId: Long,
    val vehicleId: Long? = null
)

@Document("reservations")
@CompoundIndex(name = "reservation_complex_status_idx", def = "{'complexId': 1, 'status': 1}")
data class Reservation(
    @Id
    val id: Long,
    val parkingSpaceId: Long,
    val vehicleId: Long,
    val residentId: Long,
    val complexId: Long,
    val startsAt: LocalDateTime,
    val endsAt: LocalDateTime,
    val status: ReservationStatus
)

data class CreateReservationRequest(
    val parkingSpaceId: Long,
    val vehicleId: Long,
    val residentId: Long,
    val complexId: Long,
    val startsAt: LocalDateTime,
    val endsAt: LocalDateTime
)

data class DashboardSummary(
    val complexId: Long,
    val totalSpaces: Int,
    val availableSpaces: Int,
    val occupiedSpaces: Int,
    val reservedSpaces: Int,
    val activeReservations: Int
)