import { pool } from '../config/db';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/customErrors';
import type { AppointmentStatus } from '../types/index';
import * as emailService from './emailService';

export const getServiceById = async (serviceId: number) => {
    const result = await pool.query(
        'SELECT COALESCE(duration_minutes, duration) AS duration_minutes, name AS service_name FROM services WHERE id = $1',
        [serviceId]
    );
    return result.rows[0] as { duration_minutes: number; service_name: string } | undefined;
};

export const getBusinessNameById = async (businessId: number): Promise<string> => {
    const result = await pool.query(
        'SELECT name AS business_name FROM businesses WHERE id = $1',
        [businessId]
    );
    return result.rows[0]?.business_name ?? 'Unknown Business';
};

export const getUserGoogleTokens = async (
    userId: string
): Promise<{ accessToken: string | null; refreshToken: string | null }> => {
    const result = await pool.query(
        'SELECT google_calendar_token, google_refresh_token FROM users WHERE id = $1',
        [userId]
    );
    return {
        accessToken: result.rows[0]?.google_calendar_token ?? null,
        refreshToken: result.rows[0]?.google_refresh_token ?? null,
    };
};

export const createAppointment = async (
    clientId: string,
    businessId: number,
    serviceId: number,
    startTime: Date,
    endTime: Date,
    notes: string
) => {
    const result = await pool.query(
        `INSERT INTO appointments (client_id, business_id, service_id, start_time, end_time, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [clientId, businessId, serviceId, startTime, endTime, notes]
    );

    const appointment = result.rows[0];

    // Fetch client email + owner email for notifications
    const emailResult = await pool.query(
        `SELECT
             u.email          AS client_email,
             o.email          AS owner_email,
             s.name           AS service_name,
             b.name           AS business_name
         FROM appointments a
         JOIN users u         ON u.id = a.client_id
         JOIN businesses b    ON b.id = a.business_id
         JOIN users o         ON o.id = b.owner_id
         JOIN services s      ON s.id = a.service_id
         WHERE a.id = $1`,
        [appointment.id]
    );

    if (emailResult.rows.length > 0) {
        const { client_email, owner_email, service_name, business_name } = emailResult.rows[0] as {
            client_email: string;
            owner_email: string;
            service_name: string;
            business_name: string;
        };

        const emailData: emailService.AppointmentEmailData = {
            id: appointment.id,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            service_name,
            business_name,
            notes: appointment.notes ?? undefined,
        };

        // Fire-and-forget: don't await, don't let failures bubble up
        void emailService.sendAppointmentConfirmationToClient(emailData, client_email);
        void emailService.sendNewAppointmentToOwner(emailData, owner_email);
    }

    return appointment;
};

export const getUserAppointments = async (
    clientId: string,
    page = 1,
    limit = 20
) => {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
        pool.query(
            `SELECT a.id, a.start_time, a.status,
                    b.id AS business_id,
                    b.name AS business_name,
                    s.name AS service_name,
                    s.duration_minutes
             FROM appointments a
             JOIN businesses b ON b.id = a.business_id
             JOIN services s ON s.id = a.service_id
             WHERE a.client_id = $1
             ORDER BY a.start_time DESC
             LIMIT $2 OFFSET $3`,
            [clientId, limit, offset]
        ),
        pool.query(
            'SELECT COUNT(*) FROM appointments WHERE client_id = $1',
            [clientId]
        ),
    ]);
    return {
        data: dataResult.rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit,
    };
};

export const cancelAppointment = async (appointmentId: number, clientId: string) => {
    const result = await pool.query(
        `UPDATE appointments
         SET status = 'cancelled'
         WHERE id = $1
           AND client_id = $2
           AND status IN ('pending', 'confirmed')
         RETURNING *`,
        [appointmentId, clientId]
    );
    return result.rows[0];
};

export const getOwnerAppointments = async (ownerId: string) => {
    const result = await pool.query(
        `SELECT a.id, a.start_time, a.end_time, a.status, a.notes,
                b.id AS business_id,
                b.name AS business_name,
                u.name AS client_name,
                u.email AS client_email,
                s.name AS service_name,
                s.price AS service_price
         FROM appointments a
         JOIN businesses b ON b.id = a.business_id
         JOIN users u ON u.id = a.client_id
         JOIN services s ON s.id = a.service_id
         WHERE b.owner_id = $1
         ORDER BY a.start_time DESC`,
        [ownerId]
    );
    return result.rows;
};

const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
    pending: ['confirmed'],
    confirmed: ['completed'],
    completed: [],
    cancelled: [],
};

export const updateAppointmentStatus = async (
    appointmentId: number,
    ownerId: string,
    newStatus: AppointmentStatus
): Promise<void> => {
    // Verify the appointment belongs to the owner's business
    const result = await pool.query(
        `SELECT a.status FROM appointments a
         JOIN businesses b ON b.id = a.business_id
         WHERE a.id = $1 AND b.owner_id = $2`,
        [appointmentId, ownerId]
    );
    if (result.rows.length === 0) {
        throw new NotFoundError('Turno no encontrado o sin permisos');
    }

    const currentStatus = result.rows[0].status as AppointmentStatus;
    const allowed = STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(newStatus)) {
        throw new BadRequestError(
            `Transición de estado inválida: ${currentStatus} → ${newStatus}`
        );
    }

    await pool.query(
        'UPDATE appointments SET status = $1 WHERE id = $2',
        [newStatus, appointmentId]
    );
};

export const getAvailableSlots = async (
    businessId: number,
    date: string,
    serviceId?: number
): Promise<string[]> => {
    // 1. Determine weekday (0 = Sunday, 1 = Monday, …, 6 = Saturday)
    const dateObj = new Date(`${date}T12:00:00`); // noon avoids DST edge cases
    const dayOfWeek = dateObj.getDay();

    // 2. Query business_hours for this business + weekday
    const hoursResult = await pool.query(
        `SELECT open_time, close_time, is_closed
         FROM business_hours
         WHERE business_id = $1 AND day_of_week = $2`,
        [businessId, dayOfWeek]
    );

    // If no row or is_closed, return empty
    if (hoursResult.rows.length === 0 || hoursResult.rows[0].is_closed) {
        return [];
    }

    const { open_time, close_time } = hoursResult.rows[0] as {
        open_time: string;
        close_time: string;
    };

    // 3. Determine slot duration from service (default 30 min)
    let slotDuration = 30;
    if (serviceId) {
        const svc = await getServiceById(serviceId);
        if (svc) {
            slotDuration = svc.duration_minutes;
        }
    }

    // 4. Fetch existing appointments for this date
    const existing = await pool.query(
        `SELECT start_time, end_time
         FROM appointments
         WHERE business_id = $1
           AND status NOT IN ('cancelled', 'rejected')
           AND DATE(start_time) = $2`,
        [businessId, date]
    );

    const slots: string[] = [];
    const current = new Date(`${date}T${open_time}:00`);
    const windowEnd = new Date(`${date}T${close_time}:00`);

    while (current < windowEnd) {
        const slotEnd = new Date(current.getTime() + slotDuration * 60_000);
        if (slotEnd > windowEnd) break;

        const isOccupied = existing.rows.some(app => {
            const start = new Date(app.start_time as string);
            const stop = new Date(app.end_time as string);
            return current >= start && current < stop;
        });

        if (!isOccupied) {
            slots.push(
                current.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
            );
        }

        current.setMinutes(current.getMinutes() + slotDuration);
    }

    return slots;
};
