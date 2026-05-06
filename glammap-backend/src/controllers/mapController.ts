import { Request, Response } from 'express';
import * as mapService from '../services/mapService';

export const getExploreMap = async (req: Request, res: Response) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitud y longitud son requeridas" });
        }

        const businesses = await mapService.getExploreMap(parseFloat(lat as string), parseFloat(lng as string));

        res.json(businesses);
    } catch (error) {
        console.error("Error en getExploreMap:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};