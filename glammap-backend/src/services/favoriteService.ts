import { pool } from '../config/db';

export const getUserFavorites = async (userId: string, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
        pool.query(
            `SELECT b.id, b.name, b.type, b.address, b.latitude, b.longitude,
                    b.rating_avg, b.banner_url, b.logo_url
             FROM user_favorites uf
             JOIN businesses b ON b.id = uf.business_id
             WHERE uf.user_id = $1
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        ),
        pool.query(
            'SELECT COUNT(*) FROM user_favorites WHERE user_id = $1',
            [userId]
        ),
    ]);
    return {
        data: dataResult.rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit,
    };
};

export const toggleFavorite = async (userId: string, businessId: number) => {
    const exists = await pool.query(
        'SELECT 1 FROM user_favorites WHERE user_id = $1 AND business_id = $2',
        [userId, businessId]
    );

    if (exists.rows.length > 0) {
        await pool.query(
            'DELETE FROM user_favorites WHERE user_id = $1 AND business_id = $2',
            [userId, businessId]
        );
        return 'removed';
    } else {
        await pool.query(
            'INSERT INTO user_favorites (user_id, business_id) VALUES ($1, $2)',
            [userId, businessId]
        );
        return 'added';
    }
};
