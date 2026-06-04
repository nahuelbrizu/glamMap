import { Request, Response, NextFunction } from 'express';
import * as scheduleService from '../services/scheduleService';
import type { BusinessHour } from '../types/index';

export const updateBusinessHours = async (req: Request, res: Response, next: NextFunction) => {
    const { hours } = req.body as { hours: BusinessHour[] };

    try {
        await scheduleService.updateBusinessHours(req.user.id, hours);
        res.json({ message: 'Horarios actualizados con éxito' });
    } catch (error) {
        next(error);
    }
};
