import bcrypt from 'bcryptjs';
import { sequelize, User, Hotel, Room, Booking } from './models/index.js';

const seedDatabase = async () => {
  try {
    // 1. Sincronizar la base de datos (force: true recrea las tablas limpias)
    await sequelize.sync({ force: true });
    console.log('🔄 Base de datos reestructurada y limpiada.');

    // 2. Crear usuarios de prueba con contraseñas cifradas
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const customerPassword = bcrypt.hashSync('user123', 10);

    const admin = await User.create({
      email: 'admin@tuhotel.com',
      password: adminPassword,
      role: 'admin',
    });

    const customer = await User.create({
      email: 'cliente@tuhotel.com',
      password: customerPassword,
      role: 'customer',
    });

    console.log('👤 Usuarios de prueba creados (Admin y Cliente).');

    // 3. Crear hoteles de prueba
    const hotel1 = await Hotel.create({
      name: 'Grand Hotel Central',
      address: 'Av. Principal #123, Centro',
      classification: 5,
      pricePerNight: 150.00,
      amenities: 'WiFi gratis, Piscina, Spa, Gimnasio, Restaurante',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
    });

    const hotel2 = await Hotel.create({
      name: 'Posada del Mar',
      address: 'Calle Costanera #456, Playa',
      classification: 4,
      pricePerNight: 95.00,
      amenities: 'WiFi gratis, Vista al mar, Parqueadero, Desayuno incluido',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'
    });

    console.log('🏨 Hoteles de prueba creados.');

    // 4. Crear habitaciones asociadas
    const room1 = await Room.create({
      hotelId: hotel1.id,
      roomNumber: '101',
      roomType: 'Suite Presidencial',
      capacity: 2,
      pricePerNight: 200.00,
      isAvailable: true,
    });

    const room2 = await Room.create({
      hotelId: hotel1.id,
      roomNumber: '102',
      roomType: 'Doble Deluxe',
      capacity: 4,
      pricePerNight: 150.00,
      isAvailable: true,
    });

    const room3 = await Room.create({
      hotelId: hotel2.id,
      roomNumber: '201',
      roomType: 'Habitación Sencilla',
      capacity: 1,
      pricePerNight: 95.00,
      isAvailable: true,
    });

    console.log('🛏️ Habitaciones de prueba creadas.');

    // 5. Crear una reserva de prueba para el cliente
    await Booking.create({
      userId: customer.id,
      roomId: room1.id,
      guestName: 'Carlos Pérez',
      guestPhone: '+57 300 123 4567',
      guestAddress: 'Calle 10 #20-30',
      checkInDate: '2026-11-01',
      checkOutDate: '2026-11-05',
      totalPrice: 800.00,
      status: 'active',
    });

    console.log('📅 Reserva de prueba creada.');
    console.log('✨ ¡Base de datos poblada exitosamente!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();