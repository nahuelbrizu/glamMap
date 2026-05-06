// src/routes/userRoutes.ts
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";

// Importación de Controladores
import { getExploreMap } from '../controllers/mapController';
import {
  getUserProfile,
  updateNotificationPrefs,
  updateProfile,
} from "../controllers/userController";

import {
  toggleFavorite,
  getUserFavorites,
} from "../controllers/favoriteController";

import {
  getUserAppointments,
  cancelAppointment,
} from "../controllers/appointmentController";

import { createReview } from "../controllers/reviewController";

import {
  createBusiness,
  getExploreBusinesses,
} from "../controllers/businessController";

import { getAllUsers } from "../controllers/adminController";

const router = Router();

/* ============================================================
    🌍 RUTAS PÚBLICAS (No requieren token)
   ============================================================ */

/**
 * Explorar negocios (Cards / Lista)
 * Acceso: /api/users/explore-map
 */
router.get("/explore-map", getExploreBusinesses);


/**
 * Explorar negocios (Específico para vista de Mapa)
 */
router.get("/map-data", getExploreMap);


/* ============================================================
    🔒 RUTAS PROTEGIDAS (Requieren Token Bearer)
   ============================================================ */

   /** Obtener todos los usuarios (Para Admins)
 */
/** GET /api/users/all */

router.get("/all", authenticateToken, getAllUsers);

// --- PERFIL DE USUARIO ---
// GET /api/users/profile
router.get("/profile", authenticateToken, getUserProfile);
// PUT /api/users/profile
router.put('/profile', authenticateToken, updateProfile);
// PATCH /api/users/settings/notifications
router.patch(
  "/settings/notifications",
  authenticateToken,
  updateNotificationPrefs
);

// --- FAVORITOS ---
// GET /api/users/favorites
router.get("/favorites", authenticateToken, getUserFavorites);

// POST /api/users/favorites/toggle
router.post("/favorites/toggle", authenticateToken, toggleFavorite);

// --- TURNOS / CITAS ---
// GET /api/users/appointments
router.get("/appointments", authenticateToken, getUserAppointments);

// PATCH /api/users/appointments/:id/cancel
router.patch(
  "/appointments/:id/cancel",
  authenticateToken,
  cancelAppointment
);

// POST /api/users/appointments/:id/review
router.post(
  "/appointments/:id/review",
  authenticateToken,
  createReview
);

// --- GESTIÓN DE NEGOCIO (Para dueños) ---
// POST /api/users/business
router.post(
  "/business",
  authenticateToken,
  createBusiness
);

export default router;