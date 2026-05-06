// src/routes/businessRoutes.ts
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  createBusiness,
  getExploreBusinesses,
  getBusinessById
} from "../controllers/businessController";

const router = Router();

/* =========================
   🌍 RUTAS PÚBLICAS
   ========================= */

/**
 * GET /api/business/explore
 */
router.get("/explore", getExploreBusinesses);

/* =========================
   🔒 RUTAS PROTEGIDAS
   ========================= */

/**
 * Crear un negocio
 * POST /api/business/
 */
router.post("/", authenticateToken, createBusiness);

/**
 * Obtener detalle de un negocio
 * GET /api/business/:id 
 * CORRECCIÓN: Eliminamos el prefijo '/business' extra porque ya viene de app.ts
 */
router.get('/:id', authenticateToken, getBusinessById);

export default router;