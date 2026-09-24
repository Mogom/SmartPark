package co.smartpark

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SmartParkApplication

fun main(args: Array<String>) {
    runApplication<SmartParkApplication>(*args)
}