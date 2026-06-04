import { createTransport } from 'nodemailer';
import logger from '../logger';

// ---- Configuration -------------------------------------------------------

function createTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    return createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
}

const FROM_ADDRESS = process.env.SMTP_FROM ?? 'GlamMap <no-reply@glammap.app>';

// ---- Types ---------------------------------------------------------------

export interface AppointmentEmailData {
    id: number;
    start_time: Date | string;
    end_time: Date | string;
    service_name: string;
    business_name: string;
    notes?: string;
}

// ---- Helpers -------------------------------------------------------------

function formatDateTime(dt: Date | string): string {
    const d = typeof dt === 'string' ? new Date(dt) : dt;
    return d.toLocaleString('es-AR', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/Argentina/Buenos_Aires',
    });
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
    const transporter = createTransporter();

    if (!transporter) {
        logger.warn('[emailService] SMTP env vars missing — skipping email send');
        return;
    }

    await transporter.sendMail({ from: FROM_ADDRESS, to, subject, html });
}

// ---- Public API ----------------------------------------------------------

export async function sendAppointmentConfirmationToClient(
    appointment: AppointmentEmailData,
    clientEmail: string
): Promise<void> {
    const subject = `Confirmación de turno — ${appointment.business_name}`;
    const html = `
        <h2>¡Tu turno está confirmado!</h2>
        <p>Hola, te confirmamos que tu turno ha sido reservado con éxito.</p>
        <table>
            <tr><td><strong>Negocio</strong></td><td>${appointment.business_name}</td></tr>
            <tr><td><strong>Servicio</strong></td><td>${appointment.service_name}</td></tr>
            <tr><td><strong>Fecha y hora</strong></td><td>${formatDateTime(appointment.start_time)}</td></tr>
            <tr><td><strong>Hasta</strong></td><td>${formatDateTime(appointment.end_time)}</td></tr>
            ${appointment.notes ? `<tr><td><strong>Notas</strong></td><td>${appointment.notes}</td></tr>` : ''}
        </table>
        <p>Si necesitás cancelar, hacelo con al menos 24 horas de anticipación.</p>
        <p>— El equipo de GlamMap</p>
    `;

    try {
        await sendMail(clientEmail, subject, html);
    } catch (err) {
        logger.error({ err }, '[emailService] Failed to send confirmation to client');
    }
}

export async function sendNewAppointmentToOwner(
    appointment: AppointmentEmailData,
    ownerEmail: string
): Promise<void> {
    const subject = `Nuevo turno recibido — ${appointment.service_name}`;
    const html = `
        <h2>Nuevo turno reservado</h2>
        <p>Un cliente ha reservado un turno en tu negocio.</p>
        <table>
            <tr><td><strong>Servicio</strong></td><td>${appointment.service_name}</td></tr>
            <tr><td><strong>Fecha y hora</strong></td><td>${formatDateTime(appointment.start_time)}</td></tr>
            <tr><td><strong>Hasta</strong></td><td>${formatDateTime(appointment.end_time)}</td></tr>
            ${appointment.notes ? `<tr><td><strong>Notas del cliente</strong></td><td>${appointment.notes}</td></tr>` : ''}
        </table>
        <p>Podés confirmar o gestionar el turno desde el panel de GlamMap.</p>
        <p>— El equipo de GlamMap</p>
    `;

    try {
        await sendMail(ownerEmail, subject, html);
    } catch (err) {
        logger.error({ err }, '[emailService] Failed to send notification to owner');
    }
}

export async function sendAppointmentReminder(
    appointment: AppointmentEmailData,
    clientEmail: string
): Promise<void> {
    const subject = `Recordatorio: tu turno es mañana — ${appointment.business_name}`;
    const html = `
        <h2>Recordatorio de turno</h2>
        <p>Te recordamos que tenés un turno mañana.</p>
        <table>
            <tr><td><strong>Negocio</strong></td><td>${appointment.business_name}</td></tr>
            <tr><td><strong>Servicio</strong></td><td>${appointment.service_name}</td></tr>
            <tr><td><strong>Fecha y hora</strong></td><td>${formatDateTime(appointment.start_time)}</td></tr>
            <tr><td><strong>Hasta</strong></td><td>${formatDateTime(appointment.end_time)}</td></tr>
        </table>
        <p>¡Nos vemos pronto!</p>
        <p>— El equipo de GlamMap</p>
    `;

    try {
        await sendMail(clientEmail, subject, html);
    } catch (err) {
        logger.error({ err }, '[emailService] Failed to send reminder to client');
    }
}
