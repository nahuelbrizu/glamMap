import { pool } from '../config/db';

export const getExploreMap = async (lat: number, lng: number) => {
    const query = `
        SELECT id, name, address, latitude, longitude, category, rating, image_url,
        (6371000 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
        FROM businesses
        WHERE is_active = true
        ORDER BY distance ASC
        LIMIT 20;
    `;

    const values = [lat, lng];
    const { rows } = await pool.query(query, values);

    return rows.map(b => ({
        ...b,
        position: {
            lat: parseFloat(b.latitude),
            lng: parseFloat(b.longitude)
        }
    }));
};
