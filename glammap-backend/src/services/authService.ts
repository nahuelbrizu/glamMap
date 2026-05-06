import { pool } from '../config/db';
import bcrypt from 'bcrypt';

export const findUserByEmail = async (email: string) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

export const createUser = async (name: string, email: string, phone: string, password_hash: string) => {
    const query = `
      INSERT INTO users (name, email, phone, password_hash, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, name, email, role
    `;
    const values = [name, email, phone, password_hash, 'client'];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getUserById = async (userId: number) => {
    const result = await pool.query(
        'SELECT id, name, email, role, avatar_url FROM users WHERE id = $1',
        [userId]
    );
    return result.rows[0];
}
