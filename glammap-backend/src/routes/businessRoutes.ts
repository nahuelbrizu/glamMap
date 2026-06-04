import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { createBusiness, getExploreBusinesses, getBusinessById } from '../controllers/businessController';
import { updateBusinessHours } from '../controllers/scheduleController';

const router = Router();

// --- PUBLIC ---
router.get('/explore', getExploreBusinesses);

// --- OWNER ONLY ---
router.post('/', authenticateToken, createBusiness);
router.put('/schedule', authenticateToken, updateBusinessHours);

// Dynamic segment MUST come after all static routes
router.get('/:id', getBusinessById);

export default router;
