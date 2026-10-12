import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';

// 1. Importación de las rutas del sistema
import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// 2. Importación del controlador centralizado de errores y la clase personalizada
import { AppError } from './utils/AppError.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Middlewares globales de Express
app.use(cors());
app.use(express.json());

// 3. Registro de las rutas de la API RESTful
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// 4. Middleware comodín para capturar cualquier endpoint no registrado (404 Not Found)
// ⚠️ Se utiliza app.use sin parámetro de ruta para compatibilidad completa con Express 5
app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

// 5. REGISTRO DEL MIDDLEWARE CENTRALIZADO DE ERRORES (Debe ir siempre al final)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Sincronización con la base de datos e inicio del servidor
sequelize.sync().then(() => {
  console.log('Base de datos conectada y sincronizada correctamente.');
  app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
});