import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';
import { createRoom, getHotelRooms } from '../controllers/roomController.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', [verifyToken, isAdmin], createHotel);
router.put('/:id', [verifyToken, isAdmin], updateHotel);
router.delete('/:id', [verifyToken, isAdmin], deleteHotel);

router.get('/:hotelId/rooms', [verifyToken, isAdmin], getHotelRooms);
router.post('/:hotelId/rooms', [verifyToken, isAdmin], createRoom);

export default router;
