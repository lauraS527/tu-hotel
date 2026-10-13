import { sequelize } from '../config/database.js';
import defineUser from './User.js';
import defineHotel from './Hotel.js';
import defineRoom from './Room.js';
import defineBooking from './Booking.js';

const User = defineUser(sequelize);
const Hotel = defineHotel(sequelize);
const Room = defineRoom(sequelize);
const Booking = defineBooking(sequelize);

// Relaciones 1:N
Hotel.hasMany(Room, { foreignKey: { name: 'hotelId', allowNull: false }, onDelete: 'CASCADE' });
Room.belongsTo(Hotel, { foreignKey: { name: 'hotelId', allowNull: false } });

// RESTRICT: no se puede borrar un usuario o habitación que tenga reservas
User.hasMany(Booking, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'RESTRICT' });
Booking.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });

Room.hasMany(Booking, { foreignKey: { name: 'roomId', allowNull: false }, onDelete: 'RESTRICT' });
Booking.belongsTo(Room, { foreignKey: { name: 'roomId', allowNull: false } });

export { sequelize, User, Hotel, Room, Booking };
