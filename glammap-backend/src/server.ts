import dotenv from 'dotenv';
dotenv.config();

// ---- Required env vars — process exits if any are missing ---------------
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

// ---- Optional SMTP env vars — warn but do not exit ----------------------
const SMTP_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] as const;
const missingSmtp = SMTP_VARS.filter((key) => !process.env[key]);
if (missingSmtp.length > 0) {
    console.warn(
        `[startup] SMTP env vars not set (${missingSmtp.join(', ')}) — ` +
        'email notifications will be disabled.'
    );
}

import app from './app';
import logger from './logger';
import { startReminderJob } from './jobs/reminderJob';

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    logger.info(`GlamMap Backend started on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
    startReminderJob();
});
