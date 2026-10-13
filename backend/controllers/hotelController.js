import { Op } from 'sequelize';
import { Hotel, Room, Booking } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isValidDate, nightsBetween, minBookableDate } from '../utils/dates.js';

const HOTEL_FIELDS = ['name', 'address', 'classification', 'pricePerNight', 'amenities', 'image'];

// Copia solo los campos permitidos (evita asignación masiva)
const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const validateHotel = (data, { partial = false } = {}) => {
  if (!partial) {
    for (const f of ['name', 'address', 'classification', 'pricePerNight']) {
      if (data[f] === undefined || String(data[f]).trim() === '') {
        throw new AppError('Nombre, dirección, clasificación y precio por noche son obligatorios', 400);
      }
    }
  }
  if (data.classification !== undefined) {
    const c = Number(data.classification);
    if (!Number.isInteger(c) || c < 1 || c > 5) {
      throw new AppError('La clasificación debe ser un entero entre 1 y 5', 400);
    }
  }
  if (data.pricePerNight !== undefined && !(Number(data.pricePerNight) > 0)) {
    throw new AppError('El precio por noche debe ser mayor que 0', 400);
  }
};

const positiveInt = (value, label, max) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || (max && n > max)) {
    throw new AppError(`${label} no es válido`, 400);
  }
  return n;
};

/**
 * GET /api/hotels
 * Búsqueda con filtros opcionales (query string):
 *   search   texto en nombre o dirección
 *   stars    clasificación mínima (1-5)
 *   guests   capacidad mínima de la habitación
 *   checkIn / checkOut  (AAAA-MM-DD) solo devuelve habitaciones libres en ese rango
 * Con filtros de fechas o huéspedes solo se devuelven hoteles con habitaciones que cumplan.
 */
export const getHotels = asyncHandler(async (req, res) => {
  const { search, stars, guests, checkIn, checkOut } = req.query;

  const where = {};
  if (search && String(search).trim()) {
    const like = `%${String(search).trim()}%`;
    where[Op.or] = [{ name: { [Op.like]: like } }, { address: { [Op.like]: like } }];
  }
  if (stars) where.classification = { [Op.gte]: positiveInt(stars, 'La clasificación', 5) };

  const roomWhere = { isAvailable: true };
  if (guests) roomWhere.capacity = { [Op.gte]: positiveInt(guests, 'El número de huéspedes', 20) };

  if (checkIn || checkOut) {
    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      throw new AppError('Indica fechas de entrada y salida válidas (AAAA-MM-DD).', 400);
    }
    if (checkIn < minBookableDate()) {
      throw new AppError('La fecha de entrada no puede estar en el pasado.', 400);
    }
    if (nightsBetween(checkIn, checkOut) < 1) {
      throw new AppError('La fecha de salida debe ser posterior a la de entrada.', 400);
    }

    // Habitaciones ocupadas en ese rango (dos rangos se solapan si inicioA < finB y finA > inicioB)
    const busy = await Booking.findAll({
      attributes: ['roomId'],
      where: {
        status: 'active',
        checkInDate: { [Op.lt]: checkOut },
        checkOutDate: { [Op.gt]: checkIn },
      },
      raw: true,
    });
    const busyIds = [...new Set(busy.map((b) => b.roomId))];
    if (busyIds.length) roomWhere.id = { [Op.notIn]: busyIds };
  }

  const filteringRooms = Boolean(checkIn || guests);

  const hotels = await Hotel.findAll({
    where,
    include: [{ model: Room, where: roomWhere, required: filteringRooms }],
    order: [['name', 'ASC'], [Room, 'pricePerNight', 'ASC']],
  });
  res.status(200).json(hotels);
});

export const getHotelById = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.id, {
    include: [{ model: Room, where: { isAvailable: true }, required: false }],
  });
  if (!hotel) throw new AppError('No se encontró ningún hotel con el ID especificado', 404);
  res.status(200).json(hotel);
});

export const createHotel = asyncHandler(async (req, res) => {
  const data = pick(req.body, HOTEL_FIELDS);
  validateHotel(data);
  res.status(201).json(await Hotel.create(data));
});

export const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.id);
  if (!hotel) throw new AppError('Hotel no encontrado.', 404);

  const data = pick(req.body, HOTEL_FIELDS);
  validateHotel(data, { partial: true });
  await hotel.update(data);
  res.status(200).json(hotel);
});

export const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.id);
  if (!hotel) throw new AppError('Hotel no encontrado.', 404);
  await hotel.destroy(); // si tiene reservas, el errorHandler responde 409
  res.status(204).send();
});
