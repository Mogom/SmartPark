package co.smartpark.web

import co.smartpark.domain.*
import co.smartpark.service.ParkingService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1")
class ParkingController(private val service: ParkingService) {
    @GetMapping("/complexes")
    fun complexes() = service.allComplexes()

    @GetMapping("/complexes/{id}")
    fun complex(@PathVariable id: Long) = service.complex(id)

    @GetMapping("/residents")
    fun residents(@RequestParam(required = false) complexId: Long?) = service.allResidents(complexId)

    @GetMapping("/vehicles")
    fun vehicles(@RequestParam(required = false) complexId: Long?, @RequestParam(required = false) residentId: Long?) =
        service.allVehicles(complexId, residentId)

    @GetMapping("/parking-spaces")
    fun spaces(@RequestParam(required = false) complexId: Long?, @RequestParam(required = false) status: ParkingSpaceStatus?) =
        service.allSpaces(complexId, status)

    @GetMapping("/reservations")
    fun reservations(@RequestParam(required = false) complexId: Long?, @RequestParam(required = false) status: ReservationStatus?) =
        service.allReservations(complexId, status)

    @PostMapping("/reservations")
    fun createReservation(@RequestBody request: CreateReservationRequest) = service.createReservation(request)

    @GetMapping("/dashboard/summary")
    fun summary(@RequestParam complexId: Long) = service.summary(complexId)
}