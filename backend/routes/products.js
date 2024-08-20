import express from 'express';
import { getProducts, createProduct } from '../controllers/productsController.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);

// Additional routes...

export default router;
