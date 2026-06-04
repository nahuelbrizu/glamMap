import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '../config/db';

interface SyncAppointmentData {
    businessName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
}

interface TokenData {
    userAccessToken: string;
    userRefreshToken?: string | null;
}

export const syncWithGoogle = async (
    userId: string,
    tokenData: TokenData,
    appointmentData: SyncAppointmentData
): Promise<void> => {
    const oauth2Client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    oauth2Client.setCredentials({
        access_token: tokenData.userAccessToken,
        refresh_token: tokenData.userRefreshToken ?? undefined,
    });

    if (oauth2Client.isTokenExpiring()) {
        const refreshed = await oauth2Client.refreshAccessToken();
        if (refreshed.credentials?.access_token) {
            // Persist the new access token (and refresh token if returned)
            await pool.query(
                `UPDATE users
                 SET google_calendar_token = $1,
                     google_refresh_token  = COALESCE($2, google_refresh_token)
                 WHERE id = $3`,
                [
                    refreshed.credentials.access_token,
                    refreshed.credentials.refresh_token ?? null,
                    userId,
                ]
            );
            oauth2Client.setCredentials(refreshed.credentials);
        }
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary: `Cita en ${appointmentData.businessName}`,
            description: `Servicio: ${appointmentData.serviceName}`,
            start: { dateTime: appointmentData.startTime },
            end: { dateTime: appointmentData.endTime },
        },
    });
};
