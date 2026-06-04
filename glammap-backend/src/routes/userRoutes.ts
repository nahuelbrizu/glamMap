import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { getExploreMap } from '../controllers/mapController';
import { getUserProfile, updateProfile, updateNotificationPrefs } from '../controllers/userController';
import { toggleFavorite, getUserFavorites } from '../controllers/favoriteController';
import { getUserAppointments, cancelAppointment, createAppointment, getAvailableSlots } from '../controllers/appointmentController';
import { createReview } from '../controllers/reviewController';

const router = Router();

// --- PUBLIC ---
router.get('/explore-map', getExploreMap);

// --- USER PROFILE ---
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateProfile);
router.patch('/settings/notifications', authenticateToken, updateNotificationPrefs);

// --- FAVORITES ---
router.get('/favorites', authenticateToken, getUserFavorites);
router.post('/favorites/toggle', authenticateToken, toggleFavorite);

// --- APPOINTMENTS ---
router.get('/appointments', authenticateToken, getUserAppointments);
router.post('/appointments', authenticateToken, createAppointment);
router.patch('/appointments/:id/cancel', authenticateToken, cancelAppointment);
router.get('/appointments/slots', authenticateToken, getAvailableSlots);

// --- REVIEWS ---
router.post('/appointments/:id/review', authenticateToken, createReview);

export default router;
