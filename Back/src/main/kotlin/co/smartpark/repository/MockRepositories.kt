package co.smartpark.repository

import co.smartpark.domain.*
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository

@Repository
class ComplexRepository(private val mongo: MongoTemplate) {
    fun findAll(): List<ResidentialComplex> = mongo.findAll(ResidentialComplex::class.java)
    fun findById(id: Long): ResidentialComplex? = mongo.findById(id, ResidentialComplex::class.java)
}

@Repository
class ResidentRepository(private val mongo: MongoTemplate) {
    fun findAll(complexId: Long?): List<Resident> {
        val query = Query()
        if (complexId != null) query.addCriteria(Criteria.where("complexId").`is`(complexId))
        return mongo.find(query, Resident::class.java)
    }

    fun exists(id: Long): Boolean = mongo.exists(Query.query(Criteria.where("_id").`is`(id)), Resident::class.java)
}

@Repository
class VehicleRepository(private val mongo: MongoTemplate) {
    fun findAll(complexId: Long?, residentId: Long?): List<Vehicle> {
        val criteria = mutableListOf<Criteria>()
        if (complexId != null) criteria.add(Criteria.where("complexId").`is`(complexId))
        if (residentId != null) criteria.add(Criteria.where("residentId").`is`(residentId))
        val query = Query()
        criteria.forEach(query::addCriteria)
        return mongo.find(query, Vehicle::class.java)
    }

    fun exists(id: Long): Boolean = mongo.exists(Query.query(Criteria.where("_id").`is`(id)), Vehicle::class.java)
}

@Repository
class ParkingSpaceRepository(private val mongo: MongoTemplate) {
    fun findAll(complexId: Long?, status: ParkingSpaceStatus?): List<ParkingSpace> {
        val query = Query()
        if (complexId != null) query.addCriteria(Criteria.where("complexId").`is`(complexId))
        if (status != null) query.addCriteria(Criteria.where("status").`is`(status))
        return mongo.find(query, ParkingSpace::class.java)
    }

    fun exists(id: Long): Boolean = mongo.exists(Query.query(Criteria.where("_id").`is`(id)), ParkingSpace::class.java)
}

@Repository
class ReservationRepository(private val mongo: MongoTemplate) {
    fun findAll(complexId: Long?, status: ReservationStatus?): List<Reservation> {
        val query = Query()
        if (complexId != null) query.addCriteria(Criteria.where("complexId").`is`(complexId))
        if (status != null) query.addCriteria(Criteria.where("status").`is`(status))
        return mongo.find(query, Reservation::class.java)
    }

    fun save(request: CreateReservationRequest): Reservation {
        val counter = mongo.findAndModify(
            Query.query(Criteria.where("_id").`is`("reservation")),
            Update().inc("value", 1),
            FindAndModifyOptions.options().upsert(true).returnNew(true),
            SequenceCounter::class.java
        ) ?: throw IllegalStateException("No se pudo generar el identificador de la reserva")

        return mongo.insert(Reservation(
            counter.value,
            request.parkingSpaceId,
            request.vehicleId,
            request.residentId,
            request.complexId,
            request.startsAt,
            request.endsAt,
            ReservationStatus.PENDING
        ))
    }
}

data class SequenceCounter(@Id val id: String, val value: Long)