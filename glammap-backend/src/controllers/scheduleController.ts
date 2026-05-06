// src/controllers/scheduleController.ts
import { Request, Response } from 'express';
import * as scheduleService from '../services/scheduleService';

export const updateBusinessHours = async (req: Request, res: Response) => {
    const { hours } = req.body;
    const userId = req.user.id;

    try {
        await scheduleService.updateBusinessHours(userId, hours);
        res.json({ message: "Horarios actualizados con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar horarios" });
    }
};