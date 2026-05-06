import { pool } from "../config/db";

export const getUserFavorites = async (userId: number) => {
    const result = await pool.query(
        `
        SELECT b.*
        FROM user_favorites uf
        JOIN businesses b ON b.id = uf.business_id
        WHERE uf.user_id = $1
        `,
        [userId]
    );
    return result.rows;
};

export const toggleFavorite = async (userId: number, businessId: number) => {
    const exists = await pool.query(
        "SELECT 1 FROM user_favorites WHERE user_id = $1 AND business_id = $2",
        [userId, businessId]
    );

    if (exists.rows.length > 0) {
        await pool.query(
            "DELETE FROM user_favorites WHERE user_id = $1 AND business_id = $2",
            [userId, businessId]
        );
        return "removed";
    } else {
        await pool.query(
            "INSERT INTO user_favorites (user_id, business_id) VALUES ($1, $2)",
            [userId, businessId]
        );
        return "added";
    }
};
