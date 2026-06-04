-- Migration: Add google_refresh_token column to users table
-- Run with: psql $DATABASE_URL -f scripts/migrations/001_add_google_refresh_token.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
