import { pool } from '../config/db';

export const getAllUsers = async () => {
    const users = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return users.rows;
};

export const updateUserStatus = async (id: number, role: string) => {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
};

export const getPendingBusinesses = async () => {
    const businesses = await pool.query('SELECT * FROM businesses WHERE is_active = false');
    return businesses.rows;
};

export const approveBusiness = async (id: number, active: boolean) => {
    await pool.query('UPDATE businesses SET is_active = $1 WHERE id = $2', [active, id]);
};
