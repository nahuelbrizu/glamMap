import { pool } from '../config/db';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/customErrors';

export const createReview = async (
    userId: string,
    appointmentId: number,
    rating: number,
    comment: string,
    imageUrl: string
) => {
    // 1. Verify the appointment exists and belongs to this client
    const apptResult = await pool.query(
        'SELECT id, business_id, client_id, status FROM appointments WHERE id = $1',
        [appointmentId]
    );
    if (apptResult.rows.length === 0) {
        throw new NotFoundError('Turno no encontrado');
    }

    const appointment = apptResult.rows[0];

    if (appointment.client_id !== userId) {
        throw new ForbiddenError('Este turno no te pertenece');
    }

    if (appointment.status !== 'completed') {
        throw new BadRequestError('Solo puedes reseñar turnos completados');
    }

    const businessId: number = appointment.business_id;

    // 2. Insert the review
    await pool.query(
        `INSERT INTO reviews (business_id, user_id, appointment_id, rating, comment, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [businessId, userId, appointmentId, rating, comment, imageUrl]
    );

    // 3. Recalculate business rating
    await pool.query(
        `UPDATE businesses
         SET rating_avg    = (SELECT AVG(rating)   FROM reviews WHERE business_id = $1),
             total_reviews = (SELECT COUNT(*)       FROM reviews WHERE business_id = $1)
         WHERE id = $1`,
        [businessId]
    );
};
