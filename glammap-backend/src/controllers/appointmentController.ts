// src/controllers/appointmentController.ts
import { Request, Response } from 'express';
import * as appointmentService from '../services/appointmentService';
import { syncWithGoogle } from '../services/calendarService';
import { pool } from '../config/db';

export const createAppointment = async (req: Request, res: Response) => {
    const { business_id, service_id, start_time, notes } = req.body;
    const client_id = req.user.id;

    try {
        const serviceData = await appointmentService.getServiceById(service_id);
        if (!serviceData) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }
        
        const duration = serviceData.duration;
        const startDate = new Date(start_time);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        const businessName = await appointmentService.getBusinessNameById(business_id);

        const createdAppointment = await appointmentService.createAppointment(client_id, business_id, service_id, startDate, endDate, notes);

        const userTokens = await pool.query(
            'SELECT google_calendar_token FROM users WHERE id = $1',
            [client_id]
        );

        if (userTokens.rows.length > 0 && userTokens.rows[0].google_calendar_token) {
            try {
                await syncWithGoogle(
                    client_id,
                    pool,
                    {
                        userAccessToken: userTokens.rows[0].google_calendar_token,
                    },
                    {
                        businessName: businessName,
                        serviceName: serviceData.service_name,
                        startTime: createdAppointment.start_time.toISOString(),
                        endTime: createdAppointment.end_time.toISOString(),
                    }
                );
            } catch (syncError) {
                console.error("Error syncing appointment with Google Calendar:", syncError);
            }
        }

        res.status(201).json({
            message: "¡Turno reservado con éxito!",
            appointment: createdAppointment
        });
    } catch (error) {
        console.error("Error al crear cita:", error);
        res.status(500).json({ message: "Error al procesar la reserva" });
    }
};

export const getUserAppointments = async (req: Request, res: Response) => {
    const clientId = req.user.id;

    try {
        const appointments = await appointmentService.getUserAppointments(clientId);
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los turnos' });
    }
};
export const cancelAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const clientId = req.user.id;

    try {
        const appointment = await appointmentService.cancelAppointment(parseInt(id, 10), clientId);

        if (!appointment) {
            return res.status(404).json({
                message: 'Turno no encontrado o ya cancelado'
            });
        }

        res.json({
            message: 'Turno cancelado correctamente',
            appointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cancelar el turno' });
    }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
    const { business_id, date } = req.query;

    try {
        const slots = await appointmentService.getAvailableSlots(parseInt(business_id as string, 10), date as string);
        res.json(slots);
    } catch (error) {
        console.error("Error al calcular huecos:", error);
        res.status(500).json({ message: "Error al obtener disponibilidad" });
    }
};