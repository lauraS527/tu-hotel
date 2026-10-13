export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message;
  let operational = err.isOperational || statusCode < 500;

  // Errores conocidos de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'El registro ya existe.';
    operational = true;
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join('; ');
    operational = true;
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 409;
    message = 'No se puede completar la operación: hay registros asociados (por ejemplo, reservas).';
    operational = true;
  }

  // Los errores inesperados se registran SIEMPRE
  if (!operational) console.error('💥 Error inesperado:', err);

  res.status(statusCode).json({
    status: statusCode < 500 ? 'fail' : 'error',
    statusCode,
    message: operational || process.env.NODE_ENV !== 'production' ? message : 'Error interno del servidor',
  });
};
