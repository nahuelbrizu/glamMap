import { pool } from '../config/db';

export const getAllUsers = async (page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
        pool.query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        ),
        pool.query('SELECT COUNT(*) FROM users'),
    ]);
    return {
        data: dataResult.rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit,
    };
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
