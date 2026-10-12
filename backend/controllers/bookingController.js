import { Booking, Room, Hotel } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createBooking = asyncHandler(async (req, res, next) => {
  const { roomId, guestName, guestPhone, guestAddress, checkInDate, checkOutDate, totalPrice } = req.body;

if (!roomId || !guestName || !guestPhone || !checkInDate || !checkOutDate) {
    return next(new AppError('Todos los campos son obligatorios.', 400));
  }

  const room = await Room.findByPk(roomId);
  if (!room) {
    return next(new AppError('La habitación especificada no existe.', 404));
  }
  if (!room.isAvailable) {
    return next(new AppError('La habitación no está disponible para las fechas seleccionadas.', 400));
  }
    const booking = await Booking.create({
      userId: req.userId,
      roomId,
      guestName,
      guestPhone,
      guestAddress,
      checkInDate,
      checkOutDate,
      totalPrice: totalPrice || room.pricePerNight,
    });

    res.status(201).json(booking);
  }); 

export const getUserBookings = asyncHandler(async (req, res, next) => {
    const bookings = await Booking.findAll({
      where: { userId: req.userId },
      include: [{ model: Room, include: [Hotel] }]
    });
    res.status(200).json(bookings);
  });

export const cancelBooking = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const booking = await Booking.findOne({ 
    where: { id, userId: req.userId },
 });
  if (!booking) {
    return next(new AppError('Reserva no encontrada o no pertenece al usuario autenticado.', 404));
  }
  if (booking.status === 'cancelled') {
    return next(new AppError('La reserva ya ha sido cancelada.', 400));
  }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
        status: 'success',
        message: 'Reserva cancelada correctamente.', 
        booking 
    });
  }); 

