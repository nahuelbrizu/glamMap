import { pool } from '../config/db';

export const getExploreMap = async (lat: number, lng: number, radiusKm = 10) => {
    const radiusMeters = radiusKm * 1000;

    // Haversine query with bounding-box pre-filter (works without PostGIS)
    // To use PostGIS instead, run 002_postgis_geography.sql and swap to the ST_DWithin query below.
    const BOX_DEG = 0.5; // ~55 km bounding box pre-filter
    const result = await pool.query(
        `SELECT id, name, address, latitude, longitude,
                COALESCE(category, type) AS category,
                rating_avg, banner_url, logo_url,
                (6371000 * acos(
                    cos(radians($1)) * cos(radians(latitude)) *
                    cos(radians(longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(latitude))
                )) AS distance
         FROM businesses
         WHERE is_active = true
           AND latitude  BETWEEN $1 - $3 AND $1 + $3
           AND longitude BETWEEN $2 - $4 AND $2 + $4
         ORDER BY distance ASC
         LIMIT 20`,
        [lat, lng, BOX_DEG, BOX_DEG]
    );

    // PostGIS ST_DWithin query — requires 002_postgis_geography.sql migration:
    // const result = await pool.query(
    //     `SELECT id, name, address, latitude, longitude,
    //             COALESCE(category, type) AS category,
    //             rating_avg, banner_url, logo_url,
    //             ST_Distance(location, ST_MakePoint($2, $1)::geography) AS distance
    //      FROM businesses
    //      WHERE is_active = true
    //        AND ST_DWithin(location, ST_MakePoint($2, $1)::geography, $3)
    //      ORDER BY ST_Distance(location, ST_MakePoint($2, $1)::geography) ASC
    //      LIMIT 20`,
    //     [lat, lng, radiusMeters]
    // );

    return result.rows.map(b => ({
        id: b.id,
        name: b.name,
        address: b.address,
        category: b.category,
        rating_avg: parseFloat(b.rating_avg) || 0,
        banner_url: b.banner_url || null,
        logo_url: b.logo_url || null,
        distance: parseFloat(b.distance),
        position: {
            lat: parseFloat(b.latitude),
            lng: parseFloat(b.longitude),
        },
    }));
};
