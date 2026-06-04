/**
 * Jest globalSetup — runs once before all test suites in a separate Node process.
 * Connects to the test DB, truncates key tables, then ends the pool.
 *
 * The test DB is resolved in this order:
 *   1. TEST_DATABASE_URL env var
 *   2. DATABASE_URL with the db name suffixed with "_test"
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
        // Append _test to the last path segment (the database name)
        return base.replace(/\/([^/?]+)(\?.*)?$/, '/$1_test$2');
    }

    // Fall back to individual env vars, substituting the db name
    const user = process.env['DB_USER'] ?? 'postgres';
    const host = process.env['DB_HOST'] ?? 'localhost';
    const name = (process.env['DB_NAME'] ?? 'glammap_db') + '_test';
    const password = process.env['DB_PASSWORD'] ?? '';
    const port = process.env['DB_PORT'] ?? '5432';
    return `postgresql://${user}:${password}@${host}:${port}/${name}`;
}

export default async function setup(): Promise<void> {
    const connectionString = resolveTestDatabaseUrl();
    const pool = new Pool({ connectionString });

    try {
        // Truncate tables in dependency order (children before parents)
        await pool.query(`
            TRUNCATE TABLE
                reviews,
                user_favorites,
                appointments,
                services,
                business_hours,
                businesses,
                users
            RESTART IDENTITY CASCADE;
        `);
    } finally {
        await pool.end();
    }
}
