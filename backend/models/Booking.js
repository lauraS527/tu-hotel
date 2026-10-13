import { DataTypes } from 'sequelize';
import { hoursUntilDate } from '../utils/dates.js';
import { CANCELLATION_HOURS } from '../config/policy.js';

export default (sequelize) => {
  return sequelize.define(
    'Booking',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guestName: { type: DataTypes.STRING, allowNull: false },
      guestPhone: { type: DataTypes.STRING, allowNull: false },
      guestAddress: { type: DataTypes.STRING, allowNull: false },
      checkInDate: { type: DataTypes.DATEONLY, allowNull: false },
      checkOutDate: { type: DataTypes.DATEONLY, allowNull: false },
      totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: { type: DataTypes.ENUM('active', 'cancelled'), defaultValue: 'active' },

      // Campo calculado (no existe en la tabla): ¿se puede cancelar según la política?
      canCancel: {
        type: DataTypes.VIRTUAL,
        get() {
          const checkIn = this.getDataValue('checkInDate');
          if (this.getDataValue('status') !== 'active' || !checkIn) return false;
          return hoursUntilDate(checkIn) >= CANCELLATION_HOURS;
        },
      },
    },
    {
      // Acelera la búsqueda de reservas solapadas
      indexes: [{ fields: ['roomId', 'checkInDate', 'checkOutDate'] }],
    }
  );
};
