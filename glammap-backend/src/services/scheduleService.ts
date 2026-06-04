import { pool } from '../config/db';
import type { BusinessHour } from '../types/index';

export const updateBusinessHours = async (userId: string, hours: BusinessHour[]) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const bizResult = await client.query(
            'SELECT id FROM businesses WHERE owner_id = $1',
            [userId]
        );
        const businessId = bizResult.rows[0]?.id;
        if (!businessId) {
            throw new Error('Negocio no encontrado para este usuario');
        }

        await client.query('DELETE FROM business_hours WHERE business_id = $1', [businessId]);

        const insertQuery = `
            INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
            VALUES ($1, $2, $3, $4, $5)
        `;
        for (const h of hours) {
            await client.query(insertQuery, [
                businessId,
                h.day_of_week,
                h.open_time,
                h.close_time,
                h.is_closed,
            ]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
