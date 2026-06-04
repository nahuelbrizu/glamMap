import { Request, Response, NextFunction } from 'express';
import * as mapService from '../services/mapService';

export const getExploreMap = async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lng } = req.query as { lat: string; lng: string };

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitud y longitud son requeridas' });
    }

    try {
        const businesses = await mapService.getExploreMap(parseFloat(lat), parseFloat(lng));
        res.json(businesses);
    } catch (error) {
        next(error);
    }
};
