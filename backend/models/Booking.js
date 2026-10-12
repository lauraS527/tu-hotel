import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guestName: { type: DataTypes.STRING, allowNull: false },
    guestPhone: { type: DataTypes.STRING, allowNull: false },
    guestAddress: { type: DataTypes.STRING, allowNull: false },
    checkInDate: { type: DataTypes.DATEONLY, allowNull: false },
    checkOutDate: { type: DataTypes.DATEONLY, allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('active', 'cancelled'), defaultValue: 'active' }
  });
};