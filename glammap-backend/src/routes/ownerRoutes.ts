import { Router } from 'express';
import { addService } from '../controllers/serviceController';
import { authenticateToken, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// ... ruta de registro anterior
router.post('/services', authenticateToken, checkRole(['owner']), addService);

export default router;