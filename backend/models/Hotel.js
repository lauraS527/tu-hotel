import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Hotel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    classification: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } }, // 1-5 estrellas
    pricePerNight: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
    amenities: { type: DataTypes.TEXT }, // ej. "WiFi, Piscina, Parqueadero"
    image: { type: DataTypes.STRING(500) },
  });
};
