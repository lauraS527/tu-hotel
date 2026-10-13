import express from 'express';
import { updateRoom, deleteRoom } from '../controllers/roomController.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = express.Router();

router.put('/:id', [verifyToken, isAdmin], updateRoom);
router.delete('/:id', [verifyToken, isAdmin], deleteRoom);

export default router;
