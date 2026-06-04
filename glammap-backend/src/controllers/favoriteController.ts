import { Request, Response, NextFunction } from 'express';
import * as favoriteService from '../services/favoriteService';

export const getUserFavorites = async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    try {
        const result = await favoriteService.getUserFavorites(req.user.id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
    const { businessId } = req.body as { businessId: number };

    try {
        const status = await favoriteService.toggleFavorite(req.user.id, businessId);
        res.json({ status });
    } catch (error) {
        next(error);
    }
};
