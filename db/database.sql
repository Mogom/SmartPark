-- ==========================================
-- TABLAS BASE (Residentes, Vehículos, Plazas)
-- ==========================================

CREATE TABLE bloques (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE unidades (
    id VARCHAR(20) PRIMARY KEY,
    bloque_id VARCHAR(20) REFERENCES bloques(id),
    numero VARCHAR(10) NOT NULL,
    UNIQUE (bloque_id, numero)
);

CREATE TABLE personas (
    id VARCHAR(20) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHARc(100)
);

CREATE TABLE persona_unidad (
    persona_id VARCHAR(20),
    unidad_id VARCHAR(20),
    fecha_desde DATE DEFAULT CURRENT_DATE,
    fecha_hasta DATE,
    PRIMARY KEY (persona_id, unidad_id),
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE plazas (
    id VARCHAR(20) PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('residente', 'visitante', 'discapacitado', 'motocicleta')),
    unidad_id VARCHAR(20) REFERENCES unidades(id),  -- NULL si es de visitantes/común
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE vehiculos (
    id VARCHAR(20) PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    color VARCHAR(30),
    tipo VARCHAR(20) CHECK (tipo IN ('automovil', 'motocicleta', 'camioneta')),
    propietario_id VARCHAR(20) REFERENCES personas(id)
);

-- ==========================================
-- VISITAS Y MOVIMIENTOS
-- ==========================================

CREATE TABLE visitantes (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100),
    documento VARCHAR(20),
    placa_anticipada VARCHAR(10),
    anfitrion_id VARCHAR(20) REFERENCES personas(id),
    fecha_visita DATE NOT NULL,
    hora_entrada_estimada TIME,
    estado VARCHAR(20) DEFAULT 'programada'
        CHECK (estado IN ('programada', 'en_curso', 'finalizada', 'cancelada'))
);

CREATE TABLE movimientos (
    id VARCHAR(20) PRIMARY KEY,
    vehiculo_id VARCHAR(20) REFERENCES vehiculos(id),
    visitante_id VARCHAR(20) REFERENCES visitantes(id),
    plaza_id VARCHAR(20) REFERENCES plazas(id),
    tipo_movimiento VARCHAR(10) NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida')),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guardia VARCHAR(50),
    observaciones TEXT
);

-- ==========================================
-- NUEVO: CONFIGURACIÓN DE TARIFAS
-- ==========================================

CREATE TABLE tarifas (
    id VARCHAR(20) PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,       -- Ej: "Visita hasta 4 horas", "Visita > 4h"
    valor_base DECIMAL(10,2) NOT NULL,       -- Costo base en COP/USD
    minutos_incluidos INT NOT NULL,          -- Minutos incluidos en el valor base
    costo_por_minuto_extra DECIMAL(10,2) DEFAULT 0, -- Si excede los minutos incluidos
    vigencia_desde DATE DEFAULT CURRENT_DATE,
    vigente BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- NUEVO: FACTURAS DE VISITORÍA
-- ==========================================

CREATE TABLE facturas_visitoria (
    id VARCHAR(20) PRIMARY KEY,
    movimiento_id VARCHAR(20) REFERENCES movimientos(id), -- Vinculado a la salida del vehículo
    visitante_id VARCHAR(20) REFERENCES visitantes(id),
    anfitrion_id VARCHAR(20) REFERENCES personas(id),        -- Quién paga (el residente que invitó)
    tarifa_aplicada_id VARCHAR(20) REFERENCES tarifas(id),
    tiempo_permanencia_minutos INT NOT NULL,         -- Calculado al momento de facturar
    valor_total DECIMAL(10,2) NOT NULL,              -- Suma de base + extras
    estado VARCHAR(20) DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'pagada', 'anulada', 'en_disputa')),
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP
);

-- ==========================================
-- NUEVO: DETALLE DE LA FACTURA (Auditoría)
-- ==========================================

CREATE TABLE detalle_factura (
    id VARCHAR(20) PRIMARY KEY,
    factura_id VARCHAR(20) REFERENCES facturas_visitoria(id) ON DELETE CASCADE,
    concepto VARCHAR(100) NOT NULL,                  -- Ej: "Tarifa base", "Exceso de tiempo"
    cantidad DECIMAL(10,2) NOT NULL,                 -- Cantidad (ej: minutos extra)
    valor_unitario DECIMAL(10,2) NOT NULL,           -- Precio por unidad
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * valor_unitario) STORED
);

-- ==========================================
-- NUEVO: MÉTODOS DE PAGO
-- ==========================================

CREATE TABLE pagos (
    id VARCHAR(20) PRIMARY KEY,
    factura_id VARCHAR(20) REFERENCES facturas_visitoria(id),
    metodo VARCHAR(20) CHECK (metodo IN ('efectivo', 'transferencia', 'app', 'descuento_residente')),
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(100),                         -- Número de transacción o comprobante
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aprobado_por VARCHAR(20) REFERENCES personas(id)         -- Guarda o administrador que valida
);