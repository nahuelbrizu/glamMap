// src/routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {
  registerValidationRules,
  loginValidationRules,
  validate,
} from '../middlewares/validationMiddleware';
import { authenticateToken } from '../middlewares/authMiddleware';
import {
  register,
  loginEmail,
  getMe,
} from '../controllers/auth.controller';

const router = Router();

/**
 * INICIO DE FLUJO GOOGLE
 * 'prompt: select_account' obliga a Google a preguntar qué cuenta usar, 
 * útil si el usuario tiene varias cuentas (personal y del negocio).
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'], // Added calendar scope
    prompt: 'select_account',
  })
);

/**
 * CALLBACK DE GOOGLE
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    const user = req.user as any;

    // 1. Firmamos el token incluyendo más info útil para el frontend
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    /**
     * 2. REDIRECCIÓN INTELIGENTE
     * Si el usuario es un 'owner' (dueño), quizás quieras mandarlo 
     * directo a su panel, si es 'client' al mapa.
     * Pasamos también el rol para que el frontend sepa a dónde navegar.
     */
    res.redirect(
      `${process.env.FRONTEND_URL}/auth-success?token=${token}&role=${user.role}`
    );
  }
);
// Ruta de Registro: POST /api/auth/register
router.post('/register', registerValidationRules(), validate, register);

// Ruta de Login: POST /api/auth/login
router.post('/login', loginValidationRules(), validate, loginEmail);

// Ruta de Perfil: GET /api/auth/me
router.get('/me', authenticateToken, getMe);
/**
 * RUTA DE VERIFICACIÓN (Opcional pero recomendada)
 * Permite al frontend validar si el token que tiene guardado sigue siendo válido.
 */
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

export default router;