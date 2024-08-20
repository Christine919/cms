import express from 'express';
import { getOrders, createOrder } from '../controllers/ordersController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);

// Additional routes...

export default router;
