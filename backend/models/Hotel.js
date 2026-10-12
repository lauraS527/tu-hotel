import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Hotel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    classification: { type: DataTypes.INTEGER, allowNull: false }, // 1-5 estrellas
    pricePerNight: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    amenities: { type: DataTypes.TEXT }, // ej. "WiFi, Piscina, Parqueadero"
    image: { type: DataTypes.STRING }
  });
};