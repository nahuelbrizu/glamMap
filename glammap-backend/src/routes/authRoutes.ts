// src/routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
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
  refreshToken,
} from '../controllers/auth.controller';

const authRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { message: 'Demasiados intentos. Por favor espera un minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
});

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
    const user = req.user as { id: string; role: string; name: string };

    // Issue short-lived access token (15m) + httpOnly refresh cookie (7d)
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    const refreshJwt = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.cookie('refresh_token', refreshJwt, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/auth-success?token=${accessToken}&role=${user.role}`
    );
  }
);
// Ruta de Registro: POST /api/auth/register
router.post('/register', authRateLimiter, registerValidationRules(), validate, register);

// Ruta de Login: POST /api/auth/login
router.post('/login', authRateLimiter, loginValidationRules(), validate, loginEmail);

// Ruta de refresh token: POST /api/auth/refresh
router.post('/refresh', refreshToken);

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