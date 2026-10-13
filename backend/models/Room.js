import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Room',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      roomNumber: { type: DataTypes.STRING(20), allowNull: false },
      roomType: { type: DataTypes.STRING(100), allowNull: false }, // Sencilla, Suite, Doble
      capacity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      pricePerNight: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
      isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }, // true = habilitada
    },
    {
      // No puede haber dos habitaciones con el mismo número en el mismo hotel
      indexes: [{ unique: true, fields: ['hotelId', 'roomNumber'] }],
    }
  );
};
