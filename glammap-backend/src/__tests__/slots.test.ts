import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { testPool } from './testDb';

afterAll(async () => {
    await testPool.end();
});

describe('getAvailableSlots: closed business returns empty array', () => {
    let token: string;
    let businessId: number;
    let serviceId: number;
    let tomorrowStr: string;

    beforeAll(async () => {
        // Seed a client user for authentication
        const userRes = await testPool.query<{ id: string }>(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ('Slots Client', $1, '4444444444', 'hash', 'client')
             RETURNING id`,
            [`slots_client_${Date.now()}@example.com`]
        );
        const userId = userRes.rows[0]!.id;

        // Seed an owner + business
        const ownerRes = await testPool.query<{ id: string }>(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ('Slots Owner', $1, '5555555555', 'hash', 'owner')
             RETURNING id`,
            [`slots_owner_${Date.now()}@example.com`]
        );
        const ownerId = ownerRes.rows[0]!.id;

        const bizRes = await testPool.query<{ id: number }>(
            `INSERT INTO businesses (owner_id, name, type, address, latitude, longitude, is_active)
             VALUES ($1, 'Closed Salon', 'salon', '456 Side St', -34.6, -58.4, true)
             RETURNING id`,
            [ownerId]
        );
        businessId = bizRes.rows[0]!.id;

        // Seed a service
        const svcRes = await testPool.query<{ id: number }>(
            `INSERT INTO services (business_id, name, price, duration_minutes, is_active)
             VALUES ($1, 'Manicure', 800, 30, true)
             RETURNING id`,
            [businessId]
        );
        serviceId = svcRes.rows[0]!.id;

        // Determine tomorrow's date and day_of_week
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrowStr = tomorrow.toISOString().slice(0, 10); // "YYYY-MM-DD"
        // Use noon to avoid DST edge cases (same logic as the service)
        const dayOfWeek = new Date(`${tomorrowStr}T12:00:00`).getDay();

        // Seed business_hours row with is_closed = true for tomorrow's weekday
        await testPool.query(
            `INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
             VALUES ($1, $2, '09:00', '18:00', true)`,
            [businessId, dayOfWeek]
        );

        token = jwt.sign(
            { id: userId, role: 'client' },
            process.env['JWT_SECRET'] ?? 'test_secret',
            { expiresIn: '1h' }
        );
    });

    it('GET /api/users/appointments/slots — returns empty array for closed day', async () => {
        const res = await request(app)
            .get('/api/users/appointments/slots')
            .set('Authorization', `Bearer ${token}`)
            .query({
                business_id: String(businessId),
                date: tomorrowStr,
                service_id: String(serviceId),
            })
            .expect(200);

        expect(res.body).toEqual([]);
    });
});
