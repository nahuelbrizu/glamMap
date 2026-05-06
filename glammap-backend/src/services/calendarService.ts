// src/services/calendarService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library'; // Import OAuth2Client
import { Pool } from 'pg'; // Import Pool for database operations

// Interface for the data needed to sync an appointment
interface SyncAppointmentData {
    businessName: string;
    serviceName: string;
    startTime: string; // ISO string format
    endTime: string;   // ISO string format
}

// Interface for the token data required
interface TokenData {
    userAccessToken: string;
    userRefreshToken: string;
    tokenExpiry: number; // Unix timestamp in milliseconds
}

// Added userId and dbPool for saving refreshed tokens
export const syncWithGoogle = async (userId: string, dbPool: Pool, tokenData: TokenData, appointmentData: SyncAppointmentData) => {
    const oauth2Client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    // Set credentials with access token, refresh token, and expiry
    oauth2Client.setCredentials({
        access_token: tokenData.userAccessToken,
        refresh_token: tokenData.userRefreshToken,
        expiry_date: tokenData.tokenExpiry,
    });

    try {
        // Check if token is expired and refresh if necessary
        if (oauth2Client.isTokenExpiring()) {
            console.log('Google token expiring, refreshing...');
            const newToken = await oauth2Client.refreshAccessToken();
            // Save the new access token and expiry back to the DB
            if (newToken.credentials) {
                const newAccessToken = newToken.credentials.access_token;
                const newExpiryDate = newToken.credentials.expiry_date;
                
                await dbPool.query(
                    'UPDATE users SET google_access_token = $1, google_token_expiry = $2 WHERE id = $3',
                    [newAccessToken, newExpiryDate, userId]
                );
                console.log('Google token refreshed and saved.');
                // Update oauth2Client credentials with the new token
                oauth2Client.setCredentials(newToken.credentials);
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
                // You might want to add other fields like location, attendees, etc.
            },
        });
        console.log('Appointment synced to Google Calendar successfully.');
    } catch (error) {
        console.error('Error syncing appointment with Google Calendar:', error);
        // Rethrow the error to be handled by the caller (e.g., appointmentController)
        throw error;
    }
};