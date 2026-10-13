import './config/env.js'; // debe ser el PRIMER import: carga y valida el .env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sequelize } from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

import { AppError } from './utils/AppError.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Detrás de un proxy (Render, Railway...) para que el límite de intentos vea la IP real
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
  })
);
app.use(express.json({ limit: '10kb' }));

// Máximo 20 intentos de login/registro cada 15 minutos por IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', statusCode: 429, message: 'Demasiados intentos. Intenta de nuevo más tarde.' },
});

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 para rutas no registradas (compatible con Express 5)
app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

app.use(errorHandler); // siempre al final

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // para producción real, usa migraciones
    console.log('Base de datos conectada y sincronizada correctamente.');
    app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

start();
