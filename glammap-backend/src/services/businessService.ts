import { pool } from '../config/db';

export const createBusiness = async (
    businessData: {
        name: string;
        type: string;
        address: string;
        latitude: number;
        longitude: number;
        phone?: string;
        description?: string;
        [key: string]: unknown;
    },
    ownerId: string
) => {
    const { name, type, address, latitude, longitude, phone, description } = businessData;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query = `
            INSERT INTO businesses (owner_id, name, type, address, latitude, longitude, phone, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [ownerId, name, type, address, latitude, longitude, phone, description];

        const result = await client.query(query, values);

        await client.query("UPDATE users SET role = 'owner' WHERE id = $1", [ownerId]);

        await client.query('COMMIT');

        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getExploreBusinesses = async (
    lat?: number,
    lng?: number,
    distance?: number,
    cursor?: number,
    limit = 20
) => {
    let query: string;
    let values: (number | string)[] = [];

    const searchDistanceKm = distance ?? 50;
    const searchDistanceM = searchDistanceKm * 1000; // convert km → metres for ST_DWithin

    if (lat !== undefined && lng !== undefined) {
        // Haversine query with bounding-box pre-filter (works without PostGIS)
        // To use PostGIS instead, run 002_postgis_geography.sql and swap to the ST_DWithin query below.
        const BOX_DEG = 0.5;
        const cursorClause = cursor !== undefined ? `AND distance > $4` : '';
        const cursorValues: number[] = cursor !== undefined ? [cursor] : [];

        query = `
            SELECT * FROM (
                SELECT
                    id, name, type AS category, address, latitude, longitude,
                    rating_avg, banner_url, logo_url,
                    (6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) +
                        sin(radians($1)) * sin(radians(latitude))
                    )) AS distance
                FROM businesses
                WHERE is_active = true
                  AND latitude  BETWEEN $1 - ${BOX_DEG} AND $1 + ${BOX_DEG}
                  AND longitude BETWEEN $2 - ${BOX_DEG} AND $2 + ${BOX_DEG}
            ) AS stores_with_distance
            WHERE distance <= $3
            ${cursorClause}
            ORDER BY distance ASC
            LIMIT ${limit};
        `;
        values = [lat, lng, searchDistanceKm, ...cursorValues];

        // PostGIS ST_DWithin query — requires 002_postgis_geography.sql migration:
        // const cursorClause = cursor !== undefined ? `AND dist_m > $4` : '';
        // const cursorValues: number[] = cursor !== undefined ? [cursor] : [];
        // query = `
        //     SELECT * FROM (
        //         SELECT
        //             id, name, type AS category, address, latitude, longitude,
        //             rating_avg, banner_url, logo_url,
        //             ST_Distance(location, ST_MakePoint($2, $1)::geography) AS dist_m
        //         FROM businesses
        //         WHERE is_active = true
        //           AND ST_DWithin(location, ST_MakePoint($2, $1)::geography, $3)
        //     ) AS stores_with_distance
        //     WHERE dist_m <= $3
        //     ${cursorClause}
        //     ORDER BY dist_m ASC
        //     LIMIT ${limit};
        // `;
        // values = [lat, lng, searchDistanceM, ...cursorValues];
    } else {
        query = `
            SELECT id, name, type AS category, address, latitude, longitude,
                   rating_avg, banner_url, logo_url
            FROM businesses
            WHERE is_active = true
            ORDER BY rating_avg DESC NULLS LAST
            LIMIT ${limit};
        `;
    }

    const result = await pool.query(query, values);

    const rows = result.rows.map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        address: b.address,
        rating_avg: parseFloat(b.rating_avg) || 5.0,
        banner_url: b.banner_url || 'https://via.placeholder.com/400x200?text=Business',
        logo_url: b.logo_url,
        distance: b.distance ? parseFloat(b.distance) : null, // already in km from Haversine
        position: {
            lat: parseFloat(b.latitude),
            lng: parseFloat(b.longitude),
        },
    }));

    const nextCursor = rows.length === limit && rows[rows.length - 1]?.distance !== null
        ? rows[rows.length - 1]?.distance ?? null
        : null;

    return { data: rows, nextCursor };
};

export const getBusinessById = async (id: number) => {
    const businessQuery = `SELECT * FROM businesses WHERE id = $1`;
    const businessResult = await pool.query(businessQuery, [id]);

    if (businessResult.rows.length === 0) {
        return null;
    }

    const servicesQuery = `SELECT * FROM services WHERE business_id = $1 AND is_active = true`;
    const servicesResult = await pool.query(servicesQuery, [id]);

    const business = businessResult.rows[0];
    business.services = servicesResult.rows;

    return business;
};
