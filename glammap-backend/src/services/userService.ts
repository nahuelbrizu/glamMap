import { pool } from '../config/db';

export const getAllUsers = async () => {
    const result = await pool.query(
        'SELECT id, name, email, role FROM users ORDER BY id DESC'
    );
    return result.rows;
};

export const getUserProfile = async (userId: string) => {
    const result = await pool.query(
        'SELECT id, name, email, role, avatar_url FROM users WHERE id = $1',
        [userId]
    );
    return result.rows[0];
};

export const updateProfile = async (userId: string, name: string, phone: string) => {
    const result = await pool.query(
        `UPDATE users
         SET name = $1, phone = $2
         WHERE id = $3
         RETURNING id, name, email, phone, role, avatar_url`,
        [name, phone, userId]
    );
    return result.rows[0];
};

export const updateNotificationPrefs = async (userId: string, prefs: unknown) => {
    await pool.query(
        'UPDATE users SET notification_prefs = $1 WHERE id = $2',
        [JSON.stringify(prefs), userId]
    );
};
