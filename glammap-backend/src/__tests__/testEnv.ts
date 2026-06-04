/**
 * Loaded via Jest setupFiles — runs before each test module is imported.
 * Patches DB_NAME so the main pool (config/db.ts) connects to the test database.
 */
import dotenv from 'dotenv';

dotenv.config();

const testDb = (process.env['DB_NAME'] ?? 'glammap_db') + '_test';
process.env['DB_NAME'] = testDb;
process.env['NODE_ENV'] = 'test';
