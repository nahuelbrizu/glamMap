import { Router } from 'express';
import { getNearbyBusinesses } from '../controllers/businessController';
import { createAppointment } from '../controllers/appointmentController';
import { authenticateToken, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint para el mapa (Público o Autenticado)
router.get('/explore', getNearbyBusinesses);
// Route for booking an appointment, protected by 'client' or 'owner' role
router.post('/book', authenticateToken, checkRole(['client', 'owner']), createAppointment);

export default router;