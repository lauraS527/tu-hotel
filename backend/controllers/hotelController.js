import { Hotel, Room } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHotels = asyncHandler (async (req, res, next) => {
    const hotels = await Hotel.findAll({ 
        include: [{ model: Room }] 
    });

    res.status(200).json(hotels);
  }); 

export const getHotelById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const hotel = await Hotel.findByPk(id, {
    include: [{ model: Room }],
  });

  if (!hotel) {
    return next(new AppError('No se encontró ningún hotel con el ID especificado', 404));
  }

  res.status(200).json(hotel);
});

export const createHotel = asyncHandler(async (req, res, next) => {
    const { name, address, pricePerNight } = req.body;

    if (!name || !address || !pricePerNight) {
      return next(new AppError('Los campos nombre, dirección y precio por noche son obligatorios', 400));
    }

    const newHotel = await Hotel.create(req.body);
    res.status(201).json(newHotel);
  }); 

export const updateHotel = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findByPk(id);

    if (!hotel) {
        return next(new AppError('Hotel no encontrado.', 404));
    }
    await hotel.update(req.body);
    res.status(200).json(hotel);
  });

export const deleteHotel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const hotel = await Hotel.findByPk(id);

  if (!hotel) {
    return next(new AppError('Hotel no encontrado.', 404));
  }

    await hotel.destroy();
    res.status(204).send();
  }); 