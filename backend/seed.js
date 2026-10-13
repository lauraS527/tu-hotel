import bcrypt from 'bcryptjs';
import { sequelize, User, Hotel, Room, Booking } from './models/index.js';

// Fecha relativa a hoy (AAAA-MM-DD) para que los datos de prueba siempre tengan
// reservas "próximas" y "pasadas" sin importar cuándo ejecutes el seed.
const dayOffset = (days) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('El seed borra todas las tablas y no se puede ejecutar en producción.');
    }

    await sequelize.sync({ force: true });
    console.log('🔄 Base de datos reestructurada y limpiada.');

    // Usuarios de prueba (solo desarrollo)
    const admin = await User.create({
      email: 'admin@tuhotel.com',
      password: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 10),
      role: 'admin',
    });
    const customer = await User.create({
      email: 'cliente@tuhotel.com',
      password: await bcrypt.hash(process.env.SEED_CUSTOMER_PASSWORD || 'user123', 10),
      role: 'customer',
    });
    console.log(`👤 Usuarios creados: ${admin.email} y ${customer.email}`);

    // Hoteles
    const hotels = await Hotel.bulkCreate([
      {
        name: 'Grand Hotel Central',
        address: 'Av. Principal #123, Centro',
        classification: 5,
        pricePerNight: 150,
        amenities: 'WiFi gratis, Piscina, Spa, Gimnasio, Restaurante',
        image: img('photo-1566073771259-6a8506099945'),
      },
      {
        name: 'Posada del Mar',
        address: 'Calle Costanera #456, Playa',
        classification: 4,
        pricePerNight: 95,
        amenities: 'WiFi gratis, Vista al mar, Parqueadero, Desayuno incluido',
        image: img('photo-1520250497591-112f2f40a3f4'),
      },
      {
        name: 'Casa Colonial Boutique',
        address: 'Carrera 7 #12-30, Centro Histórico',
        classification: 4,
        pricePerNight: 120,
        amenities: 'WiFi gratis, Terraza, Desayuno incluido, Pet friendly',
        image: img('photo-1551882547-ff40c63fe5fa'),
      },
      {
        name: 'Refugio de Montaña',
        address: 'Km 4 Vía al Parque Natural',
        classification: 3,
        pricePerNight: 70,
        amenities: 'WiFi gratis, Chimenea, Senderos, Parqueadero',
        image: img('photo-1542314831-068cd1dbfeeb'),
      },
    ]);
    const [central, mar, colonial, montana] = hotels;
    console.log('🏨 Hoteles creados.');

    // Habitaciones
    const rooms = await Room.bulkCreate([
      { hotelId: central.id, roomNumber: '101', roomType: 'Suite Presidencial', capacity: 2, pricePerNight: 200 },
      { hotelId: central.id, roomNumber: '102', roomType: 'Doble Deluxe', capacity: 4, pricePerNight: 150 },
      { hotelId: central.id, roomNumber: '103', roomType: 'Sencilla Ejecutiva', capacity: 1, pricePerNight: 110 },
      { hotelId: mar.id, roomNumber: '201', roomType: 'Habitación Sencilla', capacity: 1, pricePerNight: 95 },
      { hotelId: mar.id, roomNumber: '202', roomType: 'Doble Vista al Mar', capacity: 2, pricePerNight: 130 },
      { hotelId: colonial.id, roomNumber: '1', roomType: 'Habitación Patio', capacity: 2, pricePerNight: 120 },
      { hotelId: colonial.id, roomNumber: '2', roomType: 'Suite Colonial', capacity: 3, pricePerNight: 175 },
      { hotelId: montana.id, roomNumber: 'C1', roomType: 'Cabaña Familiar', capacity: 5, pricePerNight: 140 },
      { hotelId: montana.id, roomNumber: 'C2', roomType: 'Cabaña Pareja', capacity: 2, pricePerNight: 70 },
    ]);
    console.log('🛏️ Habitaciones creadas.');

    // Reservas de ejemplo: una próxima, una pasada y una cancelada
    await Booking.bulkCreate([
      {
        userId: customer.id, roomId: rooms[0].id,
        guestName: 'Carlos Pérez', guestPhone: '+57 300 123 4567', guestAddress: 'Calle 10 #20-30',
        checkInDate: dayOffset(20), checkOutDate: dayOffset(24), totalPrice: 800, status: 'active',
      },
      {
        userId: customer.id, roomId: rooms[3].id,
        guestName: 'Carlos Pérez', guestPhone: '+57 300 123 4567', guestAddress: 'Calle 10 #20-30',
        checkInDate: dayOffset(-40), checkOutDate: dayOffset(-37), totalPrice: 285, status: 'active',
      },
      {
        userId: customer.id, roomId: rooms[1].id,
        guestName: 'Carlos Pérez', guestPhone: '+57 300 123 4567', guestAddress: 'Calle 10 #20-30',
        checkInDate: dayOffset(45), checkOutDate: dayOffset(47), totalPrice: 300, status: 'cancelled',
      },
    ]);
    console.log('📅 Reservas de ejemplo creadas.');
    console.log('✨ ¡Base de datos poblada exitosamente!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error.message);
    process.exit(1);
  }
};

seedDatabase();
