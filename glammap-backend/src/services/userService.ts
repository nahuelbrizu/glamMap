import { pool } from '../config/db';

export const getAllUsers = async () => {
    const result = await pool.query(
        'SELECT id, name, email, role FROM users ORDER BY id DESC'
    );
    return result.rows;
};

export const getUserProfile = async (userId: number) => {
    const result = await pool.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [userId]
    );
    return result.rows[0];
};

export const updateNotificationPrefs = async (userId: number, prefs: any) => {
    await pool.query(
        'UPDATE users SET notification_prefs = $1 WHERE id = $2',
        [JSON.stringify(prefs), userId]
    );
};

export const updateProfile = async (userId: number, name: string, phone: string) => {
    const query = `
      UPDATE users 
      SET name = $1, phone = $2 
      WHERE id = $3 
      RETURNING id, name, email, phone, role, avatar_url
    `;
    const result = await pool.query(query, [name, phone, userId]);
    return result.rows[0];
};
