import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'tuhotel_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desactiva logs SQL extensos en la consola
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        // Por defecto se verifica el certificado. Solo ponlo en 'false' si tu proveedor lo exige.
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
    } : {},
  }
);
