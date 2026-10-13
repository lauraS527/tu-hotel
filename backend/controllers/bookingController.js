import { Op } from 'sequelize';
import { sequelize, Booking, Room, Hotel, User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isValidDate, nightsBetween, minBookableDate } from '../utils/dates.js';
import { CANCELLATION_HOURS } from '../config/policy.js';

export const createBooking = asyncHandler(async (req, res) => {
  const { roomId, guestName, guestPhone, guestAddress, checkInDate, checkOutDate } = req.body;
  // El precio total NO se lee del cliente: se calcula en el servidor.

  if (!roomId || !guestName?.trim() || !guestPhone?.trim() || !guestAddress?.trim()) {
    throw new AppError('Todos los campos del huésped son obligatorios.', 400);
  }
  if (!isValidDate(checkInDate) || !isValidDate(checkOutDate)) {
    throw new AppError('Las fechas deben tener el formato AAAA-MM-DD.', 400);
  }
  if (checkInDate < minBookableDate()) {
    throw new AppError('La fecha de check-in no puede estar en el pasado.', 400);
  }
  const nights = nightsBetween(checkInDate, checkOutDate);
  if (nights < 1) {
    throw new AppError('El check-out debe ser posterior al check-in.', 400);
  }

  // Transacción + bloqueo de la fila: evita dos reservas simultáneas de la misma habitación
  const booking = await sequelize.transaction(async (t) => {
    const room = await Room.findByPk(roomId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!room) throw new AppError('La habitación especificada no existe.', 404);
    if (!room.isAvailable) throw new AppError('La habitación no está habilitada para reservas.', 400);

    const overlap = await Booking.findOne({
      where: {
        roomId,
        status: 'active',
        checkInDate: { [Op.lt]: checkOutDate },
        checkOutDate: { [Op.gt]: checkInDate },
      },
      transaction: t,
    });
    if (overlap) {
      throw new AppError('La habitación ya está reservada en esas fechas.', 409);
    }

    return Booking.create(
      {
        userId: req.userId,
        roomId,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestAddress: guestAddress.trim(),
        checkInDate,
        checkOutDate,
        totalPrice: (nights * Number(room.pricePerNight)).toFixed(2),
      },
      { transaction: t }
    );
  });

  res.status(201).json(booking);
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.findAll({
    where: { userId: req.userId },
    include: [{ model: Room, include: [Hotel] }],
    order: [['checkInDate', 'DESC']],
  });
  res.status(200).json(bookings);
});

// Solo administradores: todas las reservas del sistema
export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.findAll({
    include: [
      { model: Room, include: [Hotel] },
      { model: User, attributes: ['id', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.status(200).json(bookings);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ where: { id: req.params.id, userId: req.userId } });

  if (!booking) {
    throw new AppError('Reserva no encontrada o no pertenece al usuario autenticado.', 404);
  }
  if (booking.status === 'cancelled') {
    throw new AppError('La reserva ya ha sido cancelada.', 400);
  }
  // Política de cancelación (ver config/policy.js)
  if (!booking.canCancel) {
    throw new AppError(
      `Solo puedes cancelar hasta ${CANCELLATION_HOURS} horas antes del check-in.`,
      400
    );
  }

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json({ status: 'success', message: 'Reserva cancelada correctamente.', booking });
});
