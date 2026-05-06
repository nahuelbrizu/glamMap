// src/controllers/businessController.ts
import { Request, Response } from 'express';
import * as businessService from '../services/businessService';

export const createBusiness = async (req: Request, res: Response) => {
    try {
        const business = await businessService.createBusiness(req.body, req.user.id);
        res.status(201).json({
            message: "¡Negocio registrado con éxito!",
            business
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar el negocio" });
    }
};

export const getExploreBusinesses = async (req: Request, res: Response) => {
    const { lat, lng, distance } = req.query;

    try {
        const businesses = await businessService.getExploreBusinesses(
            lat ? parseFloat(lat as string) : undefined,
            lng ? parseFloat(lng as string) : undefined,
            distance ? parseInt(distance as string, 10) : undefined
        );

        if (businesses.length === 0) {
            console.log("⚠️ La consulta no devolvió negocios. Revisa las coordenadas en la DB.");
        }

        res.status(200).json(businesses);
    } catch (error) {
        console.error("Error en getExploreBusinesses:", error);
        res.status(500).json({ message: "Error al obtener locales" });
    }
};

export const getBusinessById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const business = await businessService.getBusinessById(parseInt(id, 10));

        if (!business) {
            return res.status(404).json({ message: "Negocio no encontrado" });
        }

        res.json(business);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener detalles" });
    }
};