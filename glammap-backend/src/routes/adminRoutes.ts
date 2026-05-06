// src/routes/adminRoutes.ts
import { Router } from 'express';
import { getAllUsers, getPendingBusinesses, approveBusiness, updateUserStatus } from '../controllers/adminController';
import { authenticateToken, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Todas estas rutas requieren rol 'admin'
router.use(authenticateToken, checkRole(['admin']));

router.get('/users', getAllUsers);
router.patch('/users/:id', updateUserStatus);
router.get('/businesses/pending', getPendingBusinesses);
router.patch('/businesses/:id/status', approveBusiness);

export default router;