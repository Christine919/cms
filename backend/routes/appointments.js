import express from 'express';
import { getAppointments, createAppointment } from '../controllers/appointmentsController.js';

const router = express.Router();

router.get('/', getAppointments);
router.post('/', createAppointment);

// Additional routes...

export default router;
