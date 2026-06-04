import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserProfile(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { name, phone } = req.body as { name: string; phone: string };

    try {
        const user = await userService.updateProfile(req.user.id, name, phone);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Perfil actualizado', user });
    } catch (error) {
        next(error);
    }
};

export const updateNotificationPrefs = async (req: Request, res: Response, next: NextFunction) => {
    const { prefs } = req.body as { prefs: unknown };

    try {
        await userService.updateNotificationPrefs(req.user.id, prefs);
        res.json({ message: 'Preferencias actualizadas' });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};
