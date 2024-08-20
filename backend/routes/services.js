import express from 'express';
import { getServices, createService } from '../controllers/servicesController.js';

const router = express.Router();

router.get('/', getServices);
router.post('/', createService);

// Additional routes...

export default router;
