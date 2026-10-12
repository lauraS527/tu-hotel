import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Room', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    roomNumber: { type: DataTypes.STRING, allowNull: false },
    roomType: { type: DataTypes.STRING, allowNull: false }, // Sencilla, Suite, Doble
    capacity: { type: DataTypes.INTEGER, allowNull: false },
    pricePerNight: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
  });
};