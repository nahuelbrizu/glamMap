import { pool } from '../config/db';

export const createReview = async (businessId: number, userId: number, rating: number, comment: string, imageUrl: string) => {
    await pool.query(
        'INSERT INTO reviews (business_id, user_id, rating, comment, image_url) VALUES ($1, $2, $3, $4, $5)',
        [businessId, userId, rating, comment, imageUrl]
    );

    await pool.query(`
        UPDATE businesses 
        SET rating_avg = (SELECT AVG(rating) FROM reviews WHERE business_id = $1),
            total_reviews = (SELECT COUNT(*) FROM reviews WHERE business_id = $1)
        WHERE id = $1
    `, [businessId]);
};
