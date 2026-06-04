import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointmentService';
import { syncWithGoogle } from '../services/calendarService';

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
    const { business_id, service_id, start_time, notes } = req.body as {
        business_id: number;
        service_id: number;
        start_time: string;
        notes: string;
    };
    const clientId = req.user.id;

    try {
        const service = await appointmentService.getServiceById(service_id);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        const startDate = new Date(start_time);
        const endDate = new Date(startDate.getTime() + service.duration_minutes * 60_000);

        const [businessName, appointment] = await Promise.all([
            appointmentService.getBusinessNameById(business_id),
            appointmentService.createAppointment(clientId, business_id, service_id, startDate, endDate, notes),
        ]);

        const { accessToken, refreshToken } = await appointmentService.getUserGoogleTokens(clientId);
        if (accessToken) {
            syncWithGoogle(
                clientId,
                { userAccessToken: accessToken, userRefreshToken: refreshToken },
                {
                    businessName,
                    serviceName: service.service_name,
                    startTime: (appointment.start_time as Date).toISOString(),
                    endTime: (appointment.end_time as Date).toISOString(),
                }
            ).catch((err: unknown) => console.error('Google Calendar sync failed:', err));
        }

        res.status(201).json({ message: '¡Turno reservado con éxito!', appointment });
    } catch (error) {
        next(error);
    }
};

export const getUserAppointments = async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    try {
        const result = await appointmentService.getUserAppointments(req.user.id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const appointment = await appointmentService.cancelAppointment(parseInt(id, 10), req.user.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Turno no encontrado o ya cancelado' });
        }

        res.json({ message: 'Turno cancelado correctamente', appointment });
    } catch (error) {
        next(error);
    }
};

export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
    const { business_id, date, service_id } = req.query as {
        business_id: string;
        date: string;
        service_id?: string;
    };

    try {
        const slots = await appointmentService.getAvailableSlots(
            parseInt(business_id, 10),
            date,
            service_id ? parseInt(service_id, 10) : undefined
        );
        res.json(slots);
    } catch (error) {
        next(error);
    }
};
