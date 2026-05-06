import { pool } from '../config/db';

export const updateBusinessHours = async (userId: number, hours: any[]) => {
    const business = await pool.query('SELECT id FROM businesses WHERE owner_id = $1', [userId]);
    const businessId = business.rows[0].id;

    await pool.query('DELETE FROM business_hours WHERE business_id = $1', [businessId]);

    const query = `
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
        VALUES ($1, $2, $3, $4, $5)
    `;

    for (const h of hours) {
        await pool.query(query, [businessId, h.day_of_week, h.open_time, h.close_time, h.is_closed]);
    }
};
