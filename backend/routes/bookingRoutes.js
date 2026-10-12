import express from 'express';
import { 
    createBooking, 
    getUserBookings, 
    cancelBooking,
} from '../controllers/bookingController.js';
import { verifyToken } from '../middlewares/authJwt.js';

const router = express.Router();

router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getUserBookings);
router.put('/:id/cancel', verifyToken, cancelBooking);

export default router;