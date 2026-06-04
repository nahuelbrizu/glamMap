import { Router } from 'express';
import { authenticateToken, checkRole } from '../middlewares/authMiddleware';
import { listServices, createService, updateService, deleteService } from '../controllers/serviceController';
import { getOwnerAppointments, updateAppointmentStatus } from '../controllers/ownerController';
import { getOwnerStats } from '../controllers/statsController';

const router = Router();

// All owner routes require authentication and owner role
router.use(authenticateToken, checkRole(['owner']));

// --- SERVICES ---
router.get('/services', listServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// --- APPOINTMENTS ---
router.get('/appointments', getOwnerAppointments);
router.patch('/appointments/:id/status', updateAppointmentStatus);

// --- STATS (S4) ---
router.get('/stats', getOwnerStats);

export default router;
