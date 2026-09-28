# Etapa 1: Compilar la aplicación con Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copia los archivos de configuración de Maven y el código fuente
COPY pom.xml .
COPY src ./src

# Compilar generando el archivo .jar omitiendo las pruebas unitarias
RUN mvn clean package -DskipTests

# Etapa 2: Imagen final para ejecutar la aplicación
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia el JAR generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto predeterminado de Spring Boot
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]