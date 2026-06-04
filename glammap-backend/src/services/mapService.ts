import { pool } from '../config/db';

const BOX_DEG = 0.5; // ~55 km bounding box pre-filter

export const getExploreMap = async (lat: number, lng: number) => {
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
