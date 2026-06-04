import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { testPool } from './testDb';

afterAll(async () => {
    await testPool.end();
});

describe('Review: pending appointment must be rejected', () => {
    let token: string;
    let appointmentId: number;

    beforeAll(async () => {
        // Seed a client user
        const userRes = await testPool.query<{ id: string }>(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ('Review Client', $1, '6666666666', 'hash', 'client')
             RETURNING id`,
            [`review_client_${Date.now()}@example.com`]
        );
        const userId = userRes.rows[0]!.id;

        // Seed an owner + business + service
        const ownerRes = await testPool.query<{ id: string }>(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ('Review Owner', $1, '7777777777', 'hash', 'owner')
             RETURNING id`,
            [`review_owner_${Date.now()}@example.com`]
        );
        const ownerId = ownerRes.rows[0]!.id;

        const bizRes = await testPool.query<{ id: number }>(
            `INSERT INTO businesses (owner_id, name, type, address, latitude, longitude, is_active)
             VALUES ($1, 'Review Salon', 'salon', '789 Elm St', -34.6, -58.4, true)
             RETURNING id`,
            [ownerId]
        );
        const businessId = bizRes.rows[0]!.id;

        const svcRes = await testPool.query<{ id: number }>(
            `INSERT INTO services (business_id, name, price, duration_minutes, is_active)
             VALUES ($1, 'Facial', 2000, 45, true)
             RETURNING id`,
            [businessId]
        );
        const serviceId = svcRes.rows[0]!.id;

        // Seed a pending appointment
        const now = new Date();
        const apptRes = await testPool.query<{ id: number }>(
            `INSERT INTO appointments (client_id, business_id, service_id, start_time, end_time, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING id`,
            [userId, businessId, serviceId, now, new Date(now.getTime() + 45 * 60_000)]
        );
        appointmentId = apptRes.rows[0]!.id;

        token = jwt.sign(
            { id: userId, role: 'client' },
            process.env['JWT_SECRET'] ?? 'test_secret',
            { expiresIn: '1h' }
        );
    });

    it('POST /api/users/appointments/:id/review — rejects review for non-completed appointment', async () => {
        const res = await request(app)
            .post(`/api/users/appointments/${appointmentId}/review`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 5, comment: 'Great!' })
            .expect((r) => {
                expect([400, 403]).toContain(r.status);
            });

        expect(res.body).toHaveProperty('message');
    });
});
