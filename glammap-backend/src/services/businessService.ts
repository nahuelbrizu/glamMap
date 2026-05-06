import { pool } from '../config/db';

export const createBusiness = async (businessData: any, ownerId: number) => {
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

export const getExploreBusinesses = async (lat?: number, lng?: number, distance?: number) => {
    let query: string;
    let values: any[] = [];

    const searchDistance = distance || 50; 

    if (lat && lng) {
        query = `
            SELECT * FROM (
                SELECT 
                    id, name, type as category, address, latitude, longitude, 
                    rating_avg, banner_url, logo_url,
                    (6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    )) AS distance
                FROM businesses 
                WHERE is_active = true 
            ) AS stores_with_distance
            WHERE distance <= $3
            ORDER BY distance ASC;
        `;
        values = [lat, lng, searchDistance];
    } else {
        query = `
            SELECT id, name, type as category, address, latitude, longitude, 
                   rating_avg, banner_url, logo_url
            FROM businesses 
            WHERE is_active = true
            ORDER BY rating_avg DESC NULLS LAST
            LIMIT 30;
        `;
    }

    const result = await pool.query(query, values);

    return result.rows.map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        address: b.address,
        rating_avg: parseFloat(b.rating_avg) || 5.0,
        banner_url: b.banner_url || 'https://via.placeholder.com/400x200?text=Business',
        logo_url: b.logo_url,
        distance: b.distance ? parseFloat(b.distance).toFixed(1) : null,
        position: {
            lat: parseFloat(b.latitude),
            lng: parseFloat(b.longitude)
        }
    }));
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
