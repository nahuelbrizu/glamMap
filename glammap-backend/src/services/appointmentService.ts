import { pool } from '../config/db';

export const getServiceById = async (serviceId: number) => {
    const result = await pool.query('SELECT duration, name AS service_name FROM services WHERE id = $1', [serviceId]);
    return result.rows[0];
};

export const getBusinessNameById = async (businessId: number) => {
    const result = await pool.query('SELECT name AS business_name FROM businesses WHERE id = $1', [businessId]);
    return result.rows[0]?.business_name || 'Unknown Business';
};

export const createAppointment = async (clientId: number, businessId: number, serviceId: number, startTime: Date, endTime: Date, notes: string) => {
    const query = `
        INSERT INTO appointments (client_id, business_id, service_id, start_time, end_time, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *;
    `;
    const values = [clientId, businessId, serviceId, startTime, endTime, notes];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getUserAppointments = async (clientId: number) => {
    const result = await pool.query(
        `
        SELECT 
            a.id,
            a.start_time,
            a.status,
            b.name AS business_name,
            s.name AS service_name,
            s.duration_minutes
        FROM appointments a
        JOIN businesses b ON b.id = a.business_id
        JOIN services s ON s.id = a.service_id
        WHERE a.client_id = $1
        ORDER BY a.start_time DESC
        `,
        [clientId]
    );
    return result.rows;
};

export const cancelAppointment = async (appointmentId: number, clientId: number) => {
    const result = await pool.query(
        `
        UPDATE appointments
        SET status = 'cancelled'
        WHERE id = $1
          AND client_id = $2
          AND status = 'confirmed'
        RETURNING *
        `,
        [appointmentId, clientId]
    );
    return result.rows[0];
};

export const getAvailableSlots = async (businessId: number, date: string) => {
    const existingAppointments = await pool.query(
        `SELECT start_time, end_time 
         FROM appointments 
         WHERE business_id = $1 
           AND status NOT IN ('cancelled', 'rejected')
           AND DATE(start_time) = $2`,
        [businessId, date]
    );

    const slots = [];
    let currentTime = new Date(`${date}T09:00:00`);
    const endTime = new Date(`${date}T19:00:00`);

    while (currentTime < endTime) {
        const isOccupied = existingAppointments.rows.some(app => {
            const appStart = new Date(app.start_time);
            const appEnd = new Date(app.end_time);
            return currentTime >= appStart && currentTime < appEnd;
        });

        if (!isOccupied) {
            slots.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    return slots;
};
