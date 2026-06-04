-- Run as superuser or with CREATEEXTENSION privilege
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

UPDATE businesses
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE location IS NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIST(location);
