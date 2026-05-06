import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { pool } from './db';

// Interface for the Google OAuth tokens - Simplified for schema mismatch
interface GoogleTokenInfo {
  access_token: string; // This will map to google_calendar_token
  // refreshToken and expiry_date are not in the current schema, so they are omitted here.
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
  },
  async (accessToken: GoogleTokenInfo, refreshToken: string | undefined, profile: Profile, done) => {
    // `refreshToken` might be undefined if not granted the offline scope.

    const email = profile.emails![0].value;
    const googleId = profile.id;
    const name = profile.displayName;
    const avatarUrl = profile.photos![0].value;

    try {
        // Check if user exists by email
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userRes.rows.length > 0) {
            const existingUser = userRes.rows[0];
            // Update existing user with Google ID and Google Calendar Token
            // Note: refreshToken and expiry_date are not stored due to schema limitations.
            await pool.query(
                'UPDATE users SET google_id = $1, google_calendar_token = $2 WHERE id = $3 RETURNING *',
                [googleId, accessToken.access_token, existingUser.id]
            );
            
            // Construct the user object to pass to done.
            const updatedUser = {
                ...existingUser,
                google_id: googleId,
                google_calendar_token: accessToken.access_token,
            };
            return done(null, updatedUser);
        } else {
            // If user does not exist, create a new user
            // Note: refreshToken and expiry_date are not stored.
            const newUser = await pool.query(
                'INSERT INTO users (google_id, name, email, avatar_url, google_calendar_token, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [googleId, name, email, avatarUrl, accessToken.access_token, 'client'] // Default role to 'client'
            );
            
            return done(null, newUser.rows[0]);
        }
    } catch (err) {
        console.error('Error in Google Strategy passport:', err);
        return done(err as Error);
    }
  }
));