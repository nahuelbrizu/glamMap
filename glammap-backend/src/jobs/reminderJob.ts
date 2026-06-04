import cron from 'node-cron';
import { pool } from '../config/db';
import * as emailService from '../services/emailService';
import logger from '../logger';

interface ReminderRow {
    id: number;
    start_time: Date;
    end_time: Date;
    notes: string | null;
    client_email: string;
    service_name: string;
    business_name: string;
}

async function sendReminders(): Promise<void> {
    const result = await pool.query<ReminderRow>(
        `SELECT
             a.id,
             a.start_time,
             a.end_time,
             a.notes,
             u.email          AS client_email,
             s.name           AS service_name,
             b.name           AS business_name
         FROM appointments a
         JOIN users u      ON u.id = a.client_id
         JOIN businesses b ON b.id = a.business_id
         JOIN services s   ON s.id = a.service_id
         WHERE a.status != 'cancelled'
           AND a.start_time > NOW() + INTERVAL '23 hours'
           AND a.start_time < NOW() + INTERVAL '25 hours'`
    );

    if (result.rows.length === 0) return;

    logger.info(`[reminderJob] Sending ${result.rows.length} reminder(s)`);

    for (const row of result.rows) {
        const emailData: emailService.AppointmentEmailData = {
            id: row.id,
            start_time: row.start_time,
            end_time: row.end_time,
            service_name: row.service_name,
            business_name: row.business_name,
            notes: row.notes ?? undefined,
        };

        // Fire-and-forget per reminder — one failure should not stop the rest
        void emailService.sendAppointmentReminder(emailData, row.client_email);
    }
}

export function startReminderJob(): void {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', () => {
        sendReminders().catch((err: unknown) => {
            logger.error({ err }, '[reminderJob] Unexpected error during reminder sweep');
        });
    });

    logger.info('[reminderJob] Appointment reminder job scheduled (every hour)');
}
