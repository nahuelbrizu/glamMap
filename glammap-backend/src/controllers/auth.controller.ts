// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authService from '../services/authService';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../errors/customErrors';
import type { UserRole } from '../types/index';

const REFRESH_COOKIE = 'refresh_token';

interface RefreshPayload {
    id: string;
    role: UserRole;
}

function issueTokens(userId: string, role: UserRole, res: Response) {
    const accessToken = jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
    );

    const refreshJwt = jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );

    res.cookie(REFRESH_COOKIE, refreshJwt, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    return accessToken;
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, phone, password } = req.body;

  try {
    const userExists = await authService.findUserByEmail(email);

    if (userExists) {
      if (userExists.google_id && !userExists.password_hash) {
        throw new BadRequestError(
          'Este email ya está vinculado a una cuenta de Google. Por favor, inicia sesión con Google.'
        );
      }
      throw new BadRequestError('El correo electrónico ya está registrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await authService.createUser(name, email, phone, password_hash);

    const token = issueTokens(newUser.id, newUser.role, res);

    res.status(201).json({
      message: 'Registro exitoso',
      user: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const loginEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await authService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (!user.password_hash) {
      throw new BadRequestError('Este usuario usa Google Login');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = issueTokens(user.id, user.role, res);

    const { password_hash, google_id, ...userProfile } = user;
    res.json({ user: userProfile, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      throw new UnauthorizedError('Refresh token requerido');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as RefreshPayload;

    const newAccessToken = jwt.sign(
      { id: payload.id, role: payload.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    next(error);
  }
};