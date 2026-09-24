package co.smartpark.domain

import java.time.LocalDateTime

enum class ParkingSpaceStatus { AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE }
enum class VehicleType { CAR, MOTORCYCLE, BICYCLE }
enum class ReservationStatus { PENDING, ACTIVE, COMPLETED, CANCELLED }

data class ResidentialComplex(
    val id: Long,
    val name: String,
    val address: String,
    val totalParkingSpaces: Int
)

data class Resident(
    val id: Long,
    val fullName: String,
    val apartment: String,
    val email: String,
    val complexId: Long
)

data class Vehicle(
    val id: Long,
    val plate: String,
    val type: VehicleType,
    val brand: String,
    val color: String,
    val residentId: Long,
    val complexId: Long
)

data class ParkingSpace(
    val id: Long,
    val code: String,
    val floor: Int,
    val status: ParkingSpaceStatus,
    val complexId: Long,
    val vehicleId: Long? = null
)

data class Reservation(
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