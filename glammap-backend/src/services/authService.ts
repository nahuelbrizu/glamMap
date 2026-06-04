import { pool } from '../config/db';

export const findUserByEmail = async (email: string) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

export const findOrCreateGoogleUser = async (
    googleId: string,
    name: string,
    email: string,
    avatarUrl: string,
    accessToken: string,
    refreshToken?: string
) => {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
        const user = existing.rows[0];
        const updated = await pool.query(
            `UPDATE users
             SET google_id = $1,
                 google_calendar_token = $2,
                 google_refresh_token = COALESCE($3, google_refresh_token)
             WHERE id = $4
             RETURNING *`,
            [googleId, accessToken, refreshToken ?? null, user.id]
        );
        return updated.rows[0];
    }

    const created = await pool.query(
        `INSERT INTO users (google_id, name, email, avatar_url, google_calendar_token, google_refresh_token, role)
         VALUES ($1, $2, $3, $4, $5, $6, 'client')
         RETURNING *`,
        [googleId, name, email, avatarUrl, accessToken, refreshToken ?? null]
    );
    return created.rows[0];
};

export const createUser = async (
    name: string,
    email: string,
    phone: string,
    password_hash: string
) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'client')
         RETURNING id, name, email, role`,
        [name, email, phone, password_hash]
    );
    return result.rows[0];
};

export const getUserById = async (userId: string) => {
    const result = await pool.query(
        'SELECT id, name, email, role, avatar_url FROM users WHERE id = $1',
        [userId]
    );
    return result.rows[0];
};
