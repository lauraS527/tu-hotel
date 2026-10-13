import dotenv from 'dotenv';

dotenv.config();

// El servidor no arranca si falta algo esencial
const required = ['JWT_SECRET', 'DB_NAME', 'DB_USER'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
}

if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('secreto_super_seguro')) {
  throw new Error('JWT_SECRET es débil o es el valor de ejemplo. Genera uno nuevo (mínimo 32 caracteres).');
}
