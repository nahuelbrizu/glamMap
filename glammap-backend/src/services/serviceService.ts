import { pool } from '../config/db';
import { NotFoundError, ForbiddenError } from '../errors/customErrors';
import type { Service } from '../types/index';

export const getServicesByBusiness = async (businessId: number): Promise<Service[]> => {
    const result = await pool.query(
        `SELECT id, business_id, name, price,
                COALESCE(duration_minutes, duration) AS duration_minutes
         FROM services
         WHERE business_id = $1 AND is_active = true
         ORDER BY name ASC`,
        [businessId]
    );
    return result.rows;
};

export const createService = async (
    ownerId: string,
    data: { business_id: number; name: string; price: number; duration_minutes: number }
): Promise<Service> => {
    // Verify ownership
    const bizResult = await pool.query(
        'SELECT id FROM businesses WHERE id = $1 AND owner_id = $2',
        [data.business_id, ownerId]
    );
    if (bizResult.rows.length === 0) {
        throw new ForbiddenError('No tienes permiso para agregar servicios a este negocio');
    }

    const result = await pool.query(
        `INSERT INTO services (business_id, name, price, duration_minutes, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, business_id, name, price, duration_minutes`,
        [data.business_id, data.name, data.price, data.duration_minutes]
    );
    return result.rows[0];
};

export const updateService = async (
    serviceId: number,
    ownerId: string,
    data: { name?: string; price?: number; duration_minutes?: number }
): Promise<Service> => {
    // Verify service exists and owner owns the business
    const serviceResult = await pool.query(
        `SELECT s.id FROM services s
         JOIN businesses b ON b.id = s.business_id
         WHERE s.id = $1 AND b.owner_id = $2`,
        [serviceId, ownerId]
    );
    if (serviceResult.rows.length === 0) {
        throw new NotFoundError('Servicio no encontrado o sin permisos');
    }

    const setClauses: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        values.push(data.name);
    }
    if (data.price !== undefined) {
        setClauses.push(`price = $${paramIndex++}`);
        values.push(data.price);
    }
    if (data.duration_minutes !== undefined) {
        setClauses.push(`duration_minutes = $${paramIndex++}`);
        values.push(data.duration_minutes);
    }

    if (setClauses.length === 0) {
        throw new Error('No fields to update');
    }

    values.push(serviceId);
    const result = await pool.query(
        `UPDATE services
         SET ${setClauses.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, business_id, name, price, duration_minutes`,
        values
    );
    return result.rows[0];
};

export const deleteService = async (serviceId: number, ownerId: string): Promise<void> => {
    // Verify ownership
    const serviceResult = await pool.query(
        `SELECT s.id FROM services s
         JOIN businesses b ON b.id = s.business_id
         WHERE s.id = $1 AND b.owner_id = $2`,
        [serviceId, ownerId]
    );
    if (serviceResult.rows.length === 0) {
        throw new NotFoundError('Servicio no encontrado o sin permisos');
    }

    // Soft-delete
    await pool.query(
        'UPDATE services SET is_active = false WHERE id = $1',
        [serviceId]
    );
};
