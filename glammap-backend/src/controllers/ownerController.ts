import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointmentService';
import type { AppointmentStatus } from '../types/index';

export const getOwnerAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointments = await appointmentService.getOwnerAppointments(req.user.id);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body as { status: AppointmentStatus };

    try {
        await appointmentService.updateAppointmentStatus(
            parseInt(id, 10),
            req.user.id,
            status
        );
        res.json({ message: 'Estado del turno actualizado' });
    } catch (error) {
        next(error);
    }
};
