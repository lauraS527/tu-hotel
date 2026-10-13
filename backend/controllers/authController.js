import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!EMAIL_RE.test(email)) {
    throw new AppError('El correo electrónico no es válido', 400);
  }
  if (password.length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres', 400);
  }

  if (await User.findOne({ where: { email } })) {
    throw new AppError('El correo electrónico ya está registrado', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // El rol SIEMPRE es 'customer'. Los admins se crean con seed o desde otro admin.
  const user = await User.create({ email, password: hashedPassword, role: 'customer' });

  res.status(201).json({
    status: 'success',
    message: 'Usuario registrado con éxito',
    data: { id: user.id, email: user.email, role: user.role },
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    throw new AppError('El correo electrónico y la contraseña son obligatorios', 400);
  }

  const user = await User.findOne({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.password));

  if (!valid) {
    throw new AppError('Credenciales inválidas (correo o contraseña incorrectos)', 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.status(200).json({
    status: 'success',
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});
