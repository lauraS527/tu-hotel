export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('💥 Error detectado:', err);
  }

  res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    message: err.message || 'Error interno del servidor',
    ...(err.errors && { errors: err.errors })
  });
};