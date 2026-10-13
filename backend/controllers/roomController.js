import { Hotel, Room } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ROOM_FIELDS = ['roomNumber', 'roomType', 'capacity', 'pricePerNight', 'isAvailable'];

const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const validateRoom = (data, { partial = false } = {}) => {
  if (!partial) {
    for (const f of ['roomNumber', 'roomType', 'capacity', 'pricePerNight']) {
      if (data[f] === undefined || String(data[f]).trim() === '') {
        throw new AppError('Número, tipo, capacidad y precio por noche son obligatorios', 400);
      }
    }
  }
  if (data.roomNumber !== undefined && String(data.roomNumber).trim().length > 20) {
    throw new AppError('El número de habitación no puede superar 20 caracteres', 400);
  }
  if (data.capacity !== undefined) {
    const c = Number(data.capacity);
    if (!Number.isInteger(c) || c < 1) throw new AppError('La capacidad debe ser un entero mayor o igual a 1', 400);
  }
  if (data.pricePerNight !== undefined && !(Number(data.pricePerNight) > 0)) {
    throw new AppError('El precio por noche debe ser mayor que 0', 400);
  }
};

const duplicateAware = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new AppError('Ya existe una habitación con ese número en este hotel.', 409);
    }
    throw err;
  }
};

// Admin: todas las habitaciones de un hotel (incluye las deshabilitadas)
export const getHotelRooms = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);
  if (!hotel) throw new AppError('Hotel no encontrado.', 404);
  const rooms = await Room.findAll({ where: { hotelId: hotel.id }, order: [['roomNumber', 'ASC']] });
  res.status(200).json(rooms);
});

export const createRoom = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);
  if (!hotel) throw new AppError('Hotel no encontrado.', 404);

  const data = pick(req.body, ROOM_FIELDS);
  validateRoom(data);
  data.roomNumber = String(data.roomNumber).trim();
  data.roomType = String(data.roomType).trim();

  const room = await duplicateAware(() => Room.create({ ...data, hotelId: hotel.id }));
  res.status(201).json(room);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) throw new AppError('Habitación no encontrada.', 404);

  const data = pick(req.body, ROOM_FIELDS);
  validateRoom(data, { partial: true });
  await duplicateAware(() => room.update(data));
  res.status(200).json(room);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) throw new AppError('Habitación no encontrada.', 404);
  await room.destroy(); // si tiene reservas, el errorHandler responde 409
  res.status(204).send();
});
