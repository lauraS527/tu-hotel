-- =====================================================================
--  Tu Hotel — Esquema de base de datos (MySQL 8.0.16+)
--
--  Los nombres de tablas y columnas coinciden con los modelos de
--  Sequelize (Users, Hotels, Rooms, Bookings), por lo que la app
--  funciona igual si creas las tablas con este script o con
--  sequelize.sync().
--
--  Uso:   mysql -u root -p < database/schema.sql
--
--  ⚠️  Este script BORRA las tablas existentes (DROP TABLE).
--      No lo ejecutes sobre datos que quieras conservar.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS tuhotel_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tuhotel_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Rooms;
DROP TABLE IF EXISTS Hotels;
DROP TABLE IF EXISTS Users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Users: cuentas de clientes y administradores
-- ---------------------------------------------------------------------
CREATE TABLE Users (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email      VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt, nunca texto plano',
  role       ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  createdAt  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Hotels: catálogo de hoteles
-- ---------------------------------------------------------------------
CREATE TABLE Hotels (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(255) NOT NULL,
  address        VARCHAR(255) NOT NULL,
  classification TINYINT UNSIGNED NOT NULL COMMENT 'Estrellas, de 1 a 5',
  pricePerNight  DECIMAL(10, 2) NOT NULL COMMENT 'Precio de referencia "desde"',
  amenities      TEXT NULL COMMENT 'Lista separada por comas: WiFi, Piscina, ...',
  image          VARCHAR(500) NULL COMMENT 'URL de la imagen principal',
  createdAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_hotels_classification CHECK (classification BETWEEN 1 AND 5),
  CONSTRAINT chk_hotels_price CHECK (pricePerNight >= 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Rooms: habitaciones de cada hotel
--   isAvailable = habitación habilitada (false = en mantenimiento).
--   La disponibilidad por fechas se calcula con la tabla Bookings.
-- ---------------------------------------------------------------------
CREATE TABLE Rooms (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  hotelId       INT UNSIGNED NOT NULL,
  roomNumber    VARCHAR(20)  NOT NULL,
  roomType      VARCHAR(100) NOT NULL COMMENT 'Sencilla, Doble, Suite, ...',
  capacity      INT UNSIGNED NOT NULL,
  pricePerNight DECIMAL(10, 2) NOT NULL,
  isAvailable   TINYINT(1) NOT NULL DEFAULT 1,
  createdAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rooms_hotel_number (hotelId, roomNumber),
  CONSTRAINT fk_rooms_hotel
    FOREIGN KEY (hotelId) REFERENCES Hotels (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_rooms_capacity CHECK (capacity >= 1),
  CONSTRAINT chk_rooms_price CHECK (pricePerNight >= 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Bookings: reservas
--   Las reservas "cancelled" se conservan como historial (borrado lógico).
--   RESTRICT: no se puede borrar un usuario o habitación con reservas.
-- ---------------------------------------------------------------------
CREATE TABLE Bookings (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  userId       INT UNSIGNED NOT NULL,
  roomId       INT UNSIGNED NOT NULL,
  guestName    VARCHAR(255) NOT NULL,
  guestPhone   VARCHAR(255) NOT NULL,
  guestAddress VARCHAR(255) NOT NULL,
  checkInDate  DATE NOT NULL,
  checkOutDate DATE NOT NULL,
  totalPrice   DECIMAL(10, 2) NOT NULL COMMENT 'noches × precio de la habitación, calculado en el servidor',
  status       ENUM('active', 'cancelled') NOT NULL DEFAULT 'active',
  createdAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_user (userId),
  KEY idx_bookings_room_dates (roomId, checkInDate, checkOutDate),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (userId) REFERENCES Users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_room
    FOREIGN KEY (roomId) REFERENCES Rooms (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_bookings_dates CHECK (checkOutDate > checkInDate),
  CONSTRAINT chk_bookings_price CHECK (totalPrice >= 0)
) ENGINE = InnoDB;

-- =====================================================================
--  Consultas útiles
-- =====================================================================

-- ¿Está libre la habitación 1 entre el 2026-11-10 y el 2026-11-14?
-- (dos rangos se solapan si inicioA < finB Y finA > inicioB; 0 filas = libre)
--
-- SELECT id FROM Bookings
-- WHERE roomId = 1
--   AND status = 'active'
--   AND checkInDate  < '2026-11-14'
--   AND checkOutDate > '2026-11-10';

-- Habitaciones libres de un hotel en un rango de fechas
--
-- SELECT r.*
-- FROM Rooms r
-- WHERE r.hotelId = 1
--   AND r.isAvailable = 1
--   AND NOT EXISTS (
--     SELECT 1 FROM Bookings b
--     WHERE b.roomId = r.id
--       AND b.status = 'active'
--       AND b.checkInDate  < '2026-11-14'
--       AND b.checkOutDate > '2026-11-10'
--   );

-- Reservas de un usuario con hotel y habitación
--
-- SELECT b.id, h.name AS hotel, r.roomType, b.checkInDate, b.checkOutDate, b.totalPrice, b.status
-- FROM Bookings b
-- JOIN Rooms  r ON r.id = b.roomId
-- JOIN Hotels h ON h.id = r.hotelId
-- WHERE b.userId = 1
-- ORDER BY b.checkInDate DESC;

-- Ingresos por hotel (solo reservas activas)
--
-- SELECT h.name, COUNT(*) AS reservas, SUM(b.totalPrice) AS ingresos
-- FROM Bookings b
-- JOIN Rooms  r ON r.id = b.roomId
-- JOIN Hotels h ON h.id = r.hotelId
-- WHERE b.status = 'active'
-- GROUP BY h.id, h.name
-- ORDER BY ingresos DESC;

-- Datos de prueba: ejecuta `npm run seed` en /backend (genera los hashes bcrypt).
