import { Request, Response, NextFunction } from 'express';
import * as businessService from '../services/businessService';

export const createBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const business = await businessService.createBusiness(req.body, req.user.id);
        res.status(201).json({ message: '¡Negocio registrado con éxito!', business });
    } catch (error) {
        next(error);
    }
};

export const getExploreBusinesses = async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lng, distance, cursor, limit } = req.query as Record<string, string | undefined>;

    try {
        const result = await businessService.getExploreBusinesses(
            lat ? parseFloat(lat) : undefined,
            lng ? parseFloat(lng) : undefined,
            distance ? parseInt(distance, 10) : undefined,
            cursor ? parseFloat(cursor) : undefined,
            limit ? parseInt(limit, 10) : 20
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getBusinessById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const business = await businessService.getBusinessById(parseInt(id, 10));

        if (!business) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        res.json(business);
    } catch (error) {
        next(error);
    }
};
