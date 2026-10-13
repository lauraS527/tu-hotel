import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

// Verifica el token JWT del header "Authorization: Bearer <token>"
export const verifyToken = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Token de acceso no proporcionado.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    next(new AppError('Token no válido o expirado.', 401));
  }
};

// Restringe el acceso a administradores
export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return next(new AppError('Acceso denegado: requiere rol de administrador.', 403));
  }
  next();
};
