import express from 'express';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
} from '../controllers/bookingController.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = express.Router();

router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getUserBookings);
router.get('/', [verifyToken, isAdmin], getAllBookings);
router.put('/:id/cancel', verifyToken, cancelBooking);

export default router;
