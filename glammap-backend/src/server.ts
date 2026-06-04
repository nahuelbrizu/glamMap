import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables before starting
const REQUIRED_ENV_VARS = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_USER',
    'DB_NAME',
    'DB_PASSWORD',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
] as const;

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
    console.error(
        `[startup] Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please check your .env file.'
    );
    process.exit(1);
}

import app from './app';
import logger from './logger';

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    logger.info(`GlamMap Backend started on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
});
