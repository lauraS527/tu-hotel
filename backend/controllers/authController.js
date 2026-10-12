import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(new AppError('El correo electrónico y la contraseña son obligatorios', 400));
  }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return next(new AppError('El correo electrónico ya está registrado', 400));
    }       
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ 
        email, 
        password: hashedPassword, 
        role: role || 'customer',
    });

    res.status(201).json({
        status: 'success',
        message: 'Usuario registrado con éxito',
        data: { id: user.id, email: user.email, role: user.role },
    });
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('El correo electrónico y la contraseña son obligatorios', 400));
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return next(new AppError('Credenciales inválidas (correo o contraseña incorrectos)', 401));
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '8h' }
    );

    res.status(200).json({
        status: 'success', 
        token, 
        user: { id: user.id, email: user.email, role: user.role }
    });
});