/**
 * Shared test database pool.
 * Uses TEST_DATABASE_URL or falls back to DATABASE_URL with a "_test" suffix.
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function resolveTestDatabaseUrl(): string {
    if (process.env['TEST_DATABASE_URL']) {
        return process.env['TEST_DATABASE_URL'];
    }

    const base = process.env['DATABASE_URL'];
    if (base) {
        return base.replace(/\/([^/?]+)(\?.*)?$/, '/$1_test$2');
    }

    const user = process.env['DB_USER'] ?? 'postgres';
    const host = process.env['DB_HOST'] ?? 'localhost';
    const name = (process.env['DB_NAME'] ?? 'glammap_db') + '_test';
    const password = process.env['DB_PASSWORD'] ?? '';
    const port = process.env['DB_PORT'] ?? '5432';
    return `postgresql://${user}:${password}@${host}:${port}/${name}`;
}

export const testPool = new Pool({ connectionString: resolveTestDatabaseUrl() });
