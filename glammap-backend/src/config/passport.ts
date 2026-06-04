import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20';
import { findOrCreateGoogleUser } from '../services/authService';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile: Profile, done) => {
            try {
                const email = profile.emails![0]!.value;
                const user = await findOrCreateGoogleUser(
                    profile.id,
                    profile.displayName,
                    email,
                    profile.photos?.[0]?.value ?? '',
                    accessToken,
                    refreshToken ?? undefined
                );
                return done(null, user);
            } catch (err) {
                return done(err as Error);
            }
        }
    )
);
